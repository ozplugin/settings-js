import React, { useState, useRef, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import Option from './Option/Option';

export default function Filter(props) {
    const [Settings, setSettings] = useState(props.settings)
    const dispatch = useDispatch()
    const app = useSelector(state => state.app)
    const post = useSelector(state => state.app.post)
    const filter = useSelector(state => state.app.filter)

    const applyFilter = async (params, option) => {
        let fields = option.fields.filter(el => el.name == params.name);
        if (fields.length) {
            fields = fields[0]
        }
        else {
            return
        }
        let type = fields?.data_type ? fields.data_type : null;
        let newFil = {
            filter: params.name,
            value: params.value,
            type,
            validation: params.type
        }
        let newFilter = typeof filter[Settings.filter] != 'undefined' ? filter[app.activeTab] : []
        if (!params.value)
            newFilter = newFilter.filter(el => el.filter != params.name)
        else {
            let hasFil = newFilter.filter(el => el.filter == params.name)
            if (hasFil.length)
                newFilter = newFilter.map(el => {
                    if (el.filter == params.name) {
                        el = newFil
                    }
                    return el
                })
            else
                newFilter = [...newFilter, newFil]
        }
        filter[app.activeTab] = newFilter
        dispatch({ type: 'SET_FILTER', payload: filter })
        dispatch({ type: 'UPDATE_POSTS', payload: true })
        return;
    }

    useEffect(() => {
        if (app.activeTab == Settings.id) {
            if (typeof filter[app.activeTab] != 'undefined') {
                let old_filter = Settings.view?.filter
                let hasChanges = false
                let new_filter = old_filter.map(opt => {
                    opt.fields = opt.fields.map(fil => {
                        filter[app.activeTab].map(el => {
                            if (el.filter == fil.name) {
                                fil.value = el.value
                                hasChanges = true;
                            }
                        })
                        return fil
                    })
                    return opt;
                })
                if (hasChanges) {
                    Settings.view.filter = new_filter
                    setSettings(Settings)
                }
            }
        }
    }, [app.activeTab])


    return (
        <div class="ozplugin_filter d-flex ms-4">
            {Settings.view?.filter.map(option => {
                return <Option saveOption={(params, e) => { applyFilter(params, option, e) }} option={option} />
            })}</div>
    )
}