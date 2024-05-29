import { useState, useEffect } from 'react';
import axios from 'axios';
import '@mantine/core/styles.css';
import { Link } from 'react-router-dom'; // Import Link for routing
import "../styles/my-posts.css"

interface Post {
    id: number;
    createdAt: string;
    name: string;
    description: string;
    type: string;
    skills: string[];
}

export function MyPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<Post[]>('http://localhost:4000/v2/posts/my', {
                withCredentials: true  // Include cookies in the request
            });
            setPosts(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading posts: {error}</div>;

    return (
        <div className="my-myContainer">
            <div className="my-posts-container">
                    {posts.map(post => (
                        <div key={post.id} className="my-post">
                            <h2>{post.name}</h2>
                            <p>{post.description}</p>
                            <p>Type: {post.type}</p>
                            <p>Skills: {post.skills.join(', ')}</p>
                            <p>Created At: {new Date(post.createdAt).toLocaleString()}</p>
                            <Link to={`/manage-post/${post.id}`}>
                                <button className="blue-button">Manage Post</button>
                            </Link>
                        </div>
                    ))}
                </div>
        </div>
    );
}
