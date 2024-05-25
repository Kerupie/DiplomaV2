package repository

import (
	"DiplomaV2/post/models"
)

type PostRepository interface {
	Insert(post *models.Post) error
	GetAll() ([]*models.Post, error)
	GetByID(id int64) (*models.Post, error)
	Delete(id int64) error
	Update(post *models.Post) error
	DeleteAllForUser(authorid int64) error
	GetByAuthorAndType(authorid string, postType string) ([]*models.Post, error)

	// Delete GetByAuthor(authorid int64) ([]*models.Post, error)
	// Delete GetByType(postType string) ([]*models.Post, error)
}
