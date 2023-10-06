import React, { useState, useRef, useEffect } from 'react';
import { Col, ListGroup, Row, Alert, Button, Table, ButtonGroup } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import Loading from './Loading';
import { request } from './functions/functions';
import Post from './Post';

export default function Posts(props) {
    const settings = props.settings
    const dispatch = useDispatch()
    const app = useSelector(state => state.app)
    const post = useSelector(state => state.app.post)
    const update_posts = useSelector(state => state.app.update_posts)
    let cols_th = settings.view?.columns && Object.keys(settings.view.columns).length ? Object.entries(settings.view.columns).map(el => el[1].name) : ['Name', 'Date']
    const [Tr, setTr] = useState([])
    const [Page, setPage] = useState(0)
    const [LastPage, setLastPage] = useState(false)
    const [Loading, setLoading] = useState(false)
    const [NotFound, setNotFound] = useState(false)
    const [Found, setFound] = useState(null)
    const [PostStatus, setPostStatus] = useState(null)
    const columnsCount = settings.view?.columns && Object.keys(settings.view.columns).length ? Object.keys(settings.view.columns).length : 0;
    const getPosts = async (opts = {}) => {
        setFound(null)
        setNotFound(false)
        setLoading(true)
        dispatch({ type: 'UPDATE_POSTS', payload: false })
        let res = await request({
            'action': 'ozplugin_get_table',
            'post_type': settings.view.post_type,
            'columns': JSON.stringify(settings.view.columns),
            'args': JSON.stringify({ ...settings.view.args, paged: Page, post_status: opts?.post_type ? opts?.post_type : (PostStatus || 'publish') })
        })
        setLoading(false)
        if (!res.success) {
            setNotFound(true);
            return;
        }
        if (res.payload.table)
            setTr(res.payload.table)


        if (res.payload.data.found) {
            setFound(res.payload.data.found)
        }

        if (res.payload.data.isLastPage) {
            setLastPage(true)
        }
        else {
            setLastPage(false);
        }
    }

    const showAll = () => {
        setPage(0)
        setFound(null)
        setPostStatus('publish')
    }

    const showTrash = () => {
        setPage(0)
        setFound(null)
        setPostStatus('trash')
    }

    const addNew = () => {
        dispatch({ type: 'OPEN_POPUP' })
        dispatch({ type: 'SET_POST', payload: { post_type: settings.view.post_type, edit_post: settings.view.edit_post } })
    }

    const getPost = (post) => {
        dispatch({ type: 'OPEN_POPUP' })
        dispatch({ type: 'SET_POST', payload: { ...post, post_type: settings.view.post_type, edit_post: settings.view.edit_post } })
    }

    const nextPage = async () => {
        setPage(Page + 1)
    }

    const prevPage = async () => {
        setPage(Page - 1)
    }

    const emptyLines = () => {
        return [0, 1, 2].map(el => {
            let ln = []
            for (let index = 0; index <= columnsCount; index++) {
                ln.push(<td>&nbsp;</td>)
            }
            return <tr>
                {ln}
            </tr>
        })
    }

    useEffect(() => {
        if (Page > 0)
            getPosts()
    }, [Page])

    useEffect(() => {
        if (PostStatus)
            getPosts()
    }, [PostStatus])

    useEffect(() => {
        if (app.activeTab == settings.id) {
            nextPage()

        }
        else {
            setPage(0)
        }
    }, [app.activeTab])

    useEffect(() => {
        if (update_posts && app.activeTab == settings.id) {
            getPosts({ post_status: 'publish' })
        }
    }, [update_posts])

    if (NotFound)
        return (<div>Not found</div>)

    return (
        <>
            <div class="ozplugin_navigation pb-3">
                <div class="ozplugin_navigation_wrap d-flex">
                    <Button onClick={addNew} size="sm">+ {ozplugin_lang.addnew}</Button>
                    <ButtonGroup className="ms-auto">
                        <Button onClick={showAll} disabled={PostStatus != 'trash'} variant='link' size="sm">Published {(Found && PostStatus != 'trash') ? `(${Found})` : ''}</Button>
                        <Button onClick={showTrash} disabled={PostStatus == 'trash'} variant='link' size="sm">Trashed {(Found && PostStatus == 'trash') ? `(${Found})` : ''}</Button>
                    </ButtonGroup>
                </div>
            </div>
            <div class={`ozplugin-table ${Loading ? 'isLoading' : ''}`}>
                <Table size="sm">
                    <thead>
                        <tr>
                            <th></th>
                            {cols_th.map(col => {
                                return <th>{col}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {columnsCount > 0 && Tr.length > 0 ?
                            Tr.map(tr => {
                                return (<tr class="ozplugin_tr" onClick={() => { getPost(tr) }}><td></td>{Object.entries(tr).map(td => {
                                    if (td[0] == 'post_status') return null // todo 
                                    //td = typeof (settings.view.columns[td.name]) ? td[settings.view.columns[td.name]] : ''; 
                                    return (
                                        <td>{td[1]}</td>
                                    )
                                })}</tr>)
                            })
                            : <>{emptyLines()}</>}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td class="py-2">{Page > 1 && <Button size="sm" onClick={prevPage} disabled={Loading}>Prev</Button>}</td>
                            <td colspan={columnsCount ? columnsCount - 1 : 1}></td>
                            <td class="py-2 ozdon_text-right">{!LastPage && <Button size="sm" onClick={nextPage} disabled={Loading}>Next</Button>}</td>
                        </tr>
                    </tfoot>
                </Table>
            </div>
            <Post {...props} />
        </>
    )
    return (
        <Loading />
    )
}