import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Home = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [newImage, setNewImage] = useState(null); // State for storing the selected image file
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchTodos(user.uid);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchTodos = async (uid) => {
        try {
            const q = query(collection(db, 'todos'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const fetchedTodos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTodos(fetchedTodos);
        } catch (error) {
            console.error("Error fetching todos:", error);
            alert(`Failed to fetch todos: ${error.message}`);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) {
            return;
        }

        let imageUrl = '';
        if (newImage) {
            // Upload image to Firebase Storage
            const imageRef = ref(storage, `images/${user.uid}/${newImage.name}`);
            try {
                const snapshot = await uploadBytes(imageRef, newImage);
                imageUrl = await getDownloadURL(snapshot.ref); // Get the image URL
            } catch (error) {
                console.error("Error uploading image:", error);
                alert(`Failed to upload image: ${error.message}`);
                return;
            }
        }

        try {
            const docRef = await addDoc(collection(db, 'todos'), {
                text: newTodo,
                imageUrl, // Store the image URL in Firestore
                userId: user.uid,
                createdAt: new Date()
            });
            setTodos([...todos, { id: docRef.id, text: newTodo, imageUrl, userId: user.uid }]);
            setNewTodo('');
            setNewImage(null); // Reset the image input
        } catch (error) {
            console.error("Error adding todo:", error);
            alert(`Failed to add todo: ${error.message}`);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await deleteDoc(doc(db, 'todos', id));
            setTodos(todos.filter(todo => todo.id !== id));
        } catch (error) {
            console.error("Error deleting todo:", error);
            alert(`Failed to delete todo: ${error.message}`);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
            alert(`Failed to sign out: ${error.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Welcome, {user ? user.email : 'Guest'}</h2>
            <form onSubmit={addTodo}>
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])} // Handle image file input
                />
                <button type="submit">Add Todo</button>
            </form>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <div>
                            <p>{todo.text}</p>
                            {todo.imageUrl && (
                                <img src={todo.imageUrl} alt="Todo" style={{ width: '100px', height: '100px' }} />
                            )}
                        </div>
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default Home;
