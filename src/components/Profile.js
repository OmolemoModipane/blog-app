// Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('/api/profile', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    if (!user) return <div>Loading...</div>;

    return (
        <div>
            <h2>Profile</h2>
            <p>Email: {user.email}</p>
            {/* Add other user information here */}
        </div>
    );
};

export default Profile;
