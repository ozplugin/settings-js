import React, { useState, useEffect, useRef } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';


export default function Toasts(props) {
    const dispatch = useDispatch()
    const error = useSelector(state => state.app.error)
    const hide = () => {
        dispatch({type: 'REMOVE_ERROR'})
    };
    return(
        <div className='oz_toast-wrapper'>
            <ToastContainer position="top-end" className="p-3">
                <Toast show={error.error} onClose={hide} delay={3000} autohide className="bg-danger" position="top-end">
                    <Toast.Header>
                    <strong className="me-auto oz-exclamation">!</strong>
                    </Toast.Header>
                    <Toast.Body>{error.text}</Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    )
}