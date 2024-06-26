package server

import (
	"DiplomaV2/backend/internal/config"
	"DiplomaV2/backend/internal/database"
	userModels "DiplomaV2/backend/internal/entity"
	"DiplomaV2/backend/internal/mailer"
	mymiddleware "DiplomaV2/backend/internal/middleware"
	postHandlers "DiplomaV2/backend/post/handlers"
	postRepositories "DiplomaV2/backend/post/repository"
	postUseCases "DiplomaV2/backend/post/usecase"
	userHandlers "DiplomaV2/backend/user/handlers"
	userRepositories "DiplomaV2/backend/user/repository"
	tokenRepositories "DiplomaV2/backend/user/tokenRepository"
	userUseCases "DiplomaV2/backend/user/usecase"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	"net/http"
)

type echoServer struct {
	app    *echo.Echo
	db     database.Database
	conf   *config.Config
	mailer mailer.Mailer
}

func NewEchoServer(conf *config.Config, db database.Database) Server {
	echoApp := echo.New()
	echoApp.Logger.SetLevel(log.DEBUG)
	appMailer := mailer.New("sandbox.smtp.mailtrap.io", 25, "b8c7b64d353ab5", "5692cb78f75c91", "Test <no-reply@test.com>")

	return &echoServer{
		app:    echoApp,
		db:     db,
		conf:   conf,
		mailer: appMailer,
	}
}

func (s *echoServer) Start() {
	s.app.Use(middleware.Recover())
	s.app.Use(middleware.Logger())
	s.app.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173"}, // Specify your React frontend domain here
		AllowMethods:     []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete, http.MethodPatch},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	s.app.OPTIONS("/*", func(c echo.Context) error {
		return c.NoContent(http.StatusNoContent)
	})

	s.app.GET("v2/health", func(c echo.Context) error {
		return c.String(200, "OK")
	})

	s.initializeMigrations()

	s.initializePostHttpHandler()
	s.initializeUserHttpHandler()

	serverUrl := fmt.Sprintf(":%d", s.conf.Server.Port)
	s.app.Logger.Fatal(s.app.Start(serverUrl))
}

func (s *echoServer) initializeMigrations() {
	err := s.db.GetDb().AutoMigrate(
		&userModels.User{},
		&userModels.Post{},
		&userModels.Token{},
	)
	if err != nil {
		return
	}
}

func (s *echoServer) initializeUserHttpHandler() {
	userPostgresRepository := userRepositories.NewUserRepository(s.db)
	tokenPostgresRepository := tokenRepositories.NewTokenRepository(s.db)
	userUseCase := userUseCases.NewUserUseCase(userPostgresRepository, tokenPostgresRepository)
	userHttpHandler := userHandlers.NewUserHttpHandler(userUseCase, s.mailer)

	userRouters := s.app.Group("/v2/users")
	{
		userRouters.POST("/registration", userHttpHandler.Registration)
		userRouters.GET("/activate/:token", userHttpHandler.Activation)
		userRouters.POST("/login", userHttpHandler.Authentication)
		userRouters.GET("/check-auth", userHttpHandler.CheckAuth)
		userRouters.GET("/", userHttpHandler.GetAllUsers, mymiddleware.LoginMiddleware)
		userRouters.GET("/:id", userHttpHandler.GetUserInfoById, mymiddleware.LoginMiddleware)
		userRouters.GET("/my", userHttpHandler.GetMyInfo, mymiddleware.LoginMiddleware)
		userRouters.PATCH("/update", userHttpHandler.UpdateUserInfo, mymiddleware.LoginMiddleware)
		userRouters.PATCH("/password", userHttpHandler.ChangePassword, mymiddleware.LoginMiddleware)
		userRouters.POST("/logout", userHttpHandler.Logout, mymiddleware.LoginMiddleware)
		userRouters.DELETE("/", userHttpHandler.DeleteUser, mymiddleware.LoginMiddleware)
		userRouters.POST("/forgot-password", userHttpHandler.ForgotPassword)
		userRouters.POST("/reset-password", userHttpHandler.ResetPassword)
	}
}

func (s *echoServer) initializePostHttpHandler() {
	postPostgresRepository := postRepositories.NewPostRepository(s.db)
	postUseCase := postUseCases.NewPostUseCase(postPostgresRepository)
	postHttpHandler := postHandlers.NewPostHttpHandler(postUseCase)

	postRouters := s.app.Group("/v2/posts")
	{
		postRouters.POST("/", postHttpHandler.CreatePost, mymiddleware.LoginMiddleware)
		postRouters.GET("/:id", postHttpHandler.GetPostById)
		postRouters.GET("/", postHttpHandler.GetFilteredPosts)
		postRouters.GET("/my", postHttpHandler.GetMyPosts, mymiddleware.LoginMiddleware)
		postRouters.PATCH("/:id", postHttpHandler.UpdatePost, mymiddleware.LoginMiddleware)
		postRouters.DELETE("/:id", postHttpHandler.DeletePost, mymiddleware.LoginMiddleware)
	}

}
