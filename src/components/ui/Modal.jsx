import React from 'react';
import './Modal.css';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <Button variant="ghost" onClick={onClose} style={{ padding: '4px 8px', fontSize: '20px' }}>&times;</Button>
                </div>

                <div className="modal-body" style={{ padding: '0' }}>
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
