import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User authenticated:", user.uid);
                setUser(user);
                fetchTodos(user.uid);
            } else {
                console.log("User not authenticated");
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchTodos = async (uid) => {
        console.log("Fetching todos for user:", uid);
        try {
            const q = query(collection(db, 'todos'), where('userId', '==', uid));
            const querySnapshot = await getDocs(q);
            const fetchedTodos = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log("Fetched todos:", fetchedTodos);
            setTodos(fetchedTodos);
        } catch (error) {
            console.error("Error fetching todos:", error);
            alert(`Failed to fetch todos: ${error.message}`);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!newTodo.trim() || !user) {
            console.log("No todo text or user not authenticated");
            return;
        }

        try {
            console.log("Adding todo for user:", user.uid);
            const docRef = await addDoc(collection(db, 'todos'), {
                text: newTodo,
                userId: user.uid,
                createdAt: new Date()
            });
            console.log("Todo added successfully:", docRef.id);
            setTodos([...todos, { id: docRef.id, text: newTodo, userId: user.uid }]);
            setNewTodo('');
        } catch (error) {
            console.error("Error adding todo:", error);
            alert(`Failed to add todo: ${error.message}`);
        }
    };

    const deleteTodo = async (id) => {
        try {
            console.log("Deleting todo:", id);
            await deleteDoc(doc(db, 'todos', id));
            console.log("Todo deleted successfully");
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
                <button type="submit">Add Todo</button>
            </form>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.text}
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button onClick={handleSignOut}>Sign Out</button>
        </div>
    );
};

export default Home;