import React, { useState, useRef, useEffect } from 'react';
import { Col, ListGroup, Row, Alert, Button, Table } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import Loading from './Loading';
import { request } from './functions/functions';
import Option from './Option/Option';
import Toasts from './Toasts';

export default function Post(props) {
    const settings = props.settings
    const IsOpen = useSelector(state => state.app.popup)
    const loading = useSelector(state => state.app.loading)
    const activeTab = useSelector(state => state.app.activeTab)
    const [IsLoaded, setIsLoaded] = useState(false)
    const post = useSelector(state => state.app.post)
    const need_update = useSelector(state => state.app.need_update)
    const dispatch = useDispatch()

    const popup = useRef(null)

    const hidePopup = () => {
        dispatch({ type: 'CLOSE_POPUP' })
        if (need_update) {
            dispatch({ type: 'UPDATE_POSTS', payload: true })
        }

    }

    const getPost = async () => {
        if (post.id) {
            dispatch({ type: 'LOADING', payload: true })
            let params = {
                'action': 'ozplugin_get_post',
                'ID': post.id,
            }
            if (settings.view.type == 'posts') {
                params['post_type'] = settings.view.post_type;
            }
            else if (settings.view.type == 'users') {
                params['role'] = settings.view.role;

            }
            let res = await request(params)
            dispatch({ type: 'LOADING', payload: false })

            if (res && res.success) {
                dispatch({ type: 'EDIT_POST', payload: res.payload })
            }
            else {
                dispatch({ type: 'ERROR', payload: 'Something went wrong' });
            }
        }
        setIsLoaded(true)
    }

    const saveForm = async (e) => {
        let action = 'ozplugin_save_post';
        let fields = post.edit_post.map(el => el.fields).flat();
        if (settings.view.type == 'users') {
            action = 'ozplugin_save_user';
        }
        if (e.target) {
            e.target.classList.add('ozplugin_loading')
        }
        let res = await request({
            action,
            payload: JSON.stringify(fields),
            post_type: post.post_type
        })

        if (e.target) {
            e.target.classList.remove('ozplugin_loading')
        }

        if (res.success) {
            dispatch({ type: 'SET_POST_ID', payload: res.payload })
        }
        else {
            dispatch({ type: 'ERROR', payload: res.payload })
        }
    }

    const deletePost = async (e) => {
        let action = 'ozplugin_delete_post';
        if (settings.view.type == 'users') {
            action = 'ozplugin_delete_user';
        }
        if (e.target) {
            e.target.classList.add('ozplugin_loading')
        }
        let res = await request({
            action,
            ID: post.id
        })

        if (e.target) {
            e.target.classList.remove('ozplugin_loading')
        }

        if (res.success) {
            dispatch({ type: 'DELETE_RESTORE_POST', payload: res.payload })
        }
        else {
            dispatch({ type: 'ERROR', payload: ozplugin_lang.somethingwentwrong })
        }

    }

    const restorePost = async (e) => {
        if (e.target) {
            e.target.classList.add('ozplugin_loading')
        }
        let res = await request({
            action: 'ozplugin_restore_post',
            ID: post.id
        })

        if (e.target) {
            e.target.classList.remove('ozplugin_loading')
        }

        if (res.success) {

            dispatch({ type: 'DELETE_RESTORE_POST', payload: res.payload })
        }
        else {
            dispatch({ type: 'ERROR', payload: ozplugin_lang.somethingwentwrong })
        }

    }

    const saveOption = async (val) => {
        dispatch({ type: 'LOADING', payload: true })
        dispatch({ type: 'NEED_UPDATE' })
        let post_edit = post.edit_post.map(el => {
            el.fields.map(elem => {
                if (elem.name == val.name) {
                    elem.value = val.value
                }
                return elem
            })
            return el
        })
        dispatch({ type: 'EDIT_POST', payload: post_edit })
        if (!post.id) {

            return false;
        }

        let action = 'ozplugin_save_post_data';
        if (settings.view.type == 'users') {
            action = 'ozplugin_save_user_data';
        }

        let option = post.edit_post.map(el => el.fields.filter(el => el.name == val.name)).flat();

        if (option.length) {
            option = option[0]
            option = {
                ...option,
                ...{
                    ...val,
                    ID: post.id,
                    action
                }
            }
            let res = await request(option)

            if (res.success) {

            }
            else {
                dispatch({ type: 'ERROR', payload: res.payload })
            }
        }

        dispatch({ type: 'LOADING', payload: false })

    }


    useEffect(() => {
        if (!IsOpen) {
            if (popup.current) {
                popup.current.classList.remove('active')
                setIsLoaded(false)
                setTimeout(() => {
                    popup.current.style.display = 'none'
                }, 150)
            }
        }
        if (props.settings.id != activeTab) return;

        if (IsOpen) {
            getPost(post.id)
            popup.current.style.display = 'block'
            setTimeout(() => {
                popup.current.classList.add('active')
            }, 150)
        }
    }, [IsOpen])



    return (
        <div ref={popup} class={`ozplugin_sidebar-overlay`}>
            <div onClick={hidePopup} class="ozplugin_sidebar-shadow"></div>
            <div class="ozplugin_sidebar">
                <div class="ozplugin_sidebar-wrap">
                    <div class="ozplugin_sidebar-header">
                        <div class="ozplugin_sidebar-title">{post.id ? 'Edit post' : 'Add'}</div>
                        <div onClick={hidePopup} class="ozplugin_close">✖</div>
                    </div>
                    <div class="ozplugin_sidebar-body">
                        <form class="ozplugin_post_form">
                            {IsLoaded ? post.edit_post && post.edit_post.map(option => {
                                return <Option saveOption={saveOption} option={option} />
                            }) : <Loading />}
                        </form>
                    </div>
                    <div class="ozplugin_sidebar-footer pt-3">
                        {IsLoaded ?
                            <>
                                {!post.id && <Button onClick={saveForm}>Save</Button>}
                                {(post.id && (post?.post_status == 'publish' || !post?.post_status)) && <Button onClick={deletePost} variant='danger'>Delete</Button>}
                                {(post.id && post?.post_status && post?.post_status != 'publish') && <Button onClick={restorePost} variant='danger'>Restore</Button>}
                            </>
                            : ''
                        }
                    </div>
                </div>
            </div>
            <Toasts />
        </div>
    )
    return (
        <Loading />
    )
}