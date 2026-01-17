import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';

const PlaceholderPage = ({ title }) => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '48px' }}>
            <Card style={{ textAlign: 'center', padding: '64px' }}>
                <h1 style={{ marginBottom: '16px', fontSize: '32px' }}>{title}</h1>
                <p style={{ color: '#666', marginBottom: '32px' }}>This module is currently being set up for the demonstration.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </Card>
        </div>
    );
};

export default PlaceholderPage;
