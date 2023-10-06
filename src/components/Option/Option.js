import React, { useState, useRef, useEffect } from 'react';
import { Card, Col, Form, FormCheck, FormControl, ListGroup, ListGroupItem, Row, Overlay, Tooltip } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import 'react-phone-input-2/lib/style.css'
import store from '../../store'
import { request, selectText } from '../functions/functions';
import sanitize from 'sanitize-html';

const toCamelCased = (string) => {
    return string.replace(/-([a-z])/gi, function (s, group1) {
        return group1.toUpperCase();
    });
}

const saveOption = async (option) => {
    const dispatch = store.dispatch
    dispatch({ type: 'LOADING', payload: true })
    try {
        let body = new URLSearchParams()
        body.set('action', 'ozplugin_save_option')
        body.set('_wpnonce', ozplugin_vars.nonce)
        Object.entries(option).map(el => {
            body.set(el[0], el[1])
        })

        let res = await fetch(ozplugin_vars.adminAjax, {
            method: 'post',
            body,
        })
        if (ozplugin_vars.debug) console.log(res)
        if (res.status != 200) {
            console.log('error')
            dispatch({
                type: 'ERROR',
                payload: res.statusText,
            })
        }
        else {
            res = await res.json()
            if (ozplugin_vars.debug) console.log(res)
            if (!res.success) {
                dispatch({
                    type: 'ERROR',
                    payload: res.text,
                })
            }
        }
    }
    catch (e) {
        dispatch({
            type: 'ERROR',
            payload: typeof e == 'string' ? e : e.message,
        })
        console.log(e)
    }
    dispatch({ type: 'LOADING', payload: false });
    [...document.querySelectorAll('.oz_loading')].map(el => { el.classList.remove('disabled'); el.classList.remove('oz_loading') })
}

const getField = (option, props = {}) => {
    let style = option?.style ? option.style : {}
    if (Object.keys(style).length) {
        let newStyle = {}
        Object.keys(style).map(el => {
            newStyle[toCamelCased(el)] = style[el]
        })
        style = newStyle
    }
    let title = option?.title
    let description = option?.description ? <p className='text-muted'>{option?.description}</p> : null
    let tpl = <div>{`Unknown option type "${option.type}"`}</div>


    if (option.condition?.length) {
        let valid = false
        let fin = []
        option.condition.map(el => {
            fin = props.option.fields.filter(e => e.name == el.key && e.value == el.value)
        })
        if (fin.length == option.condition.length) {
            valid = true;
        }

        if (!valid) return null
    }
    switch (option.type) {
        case 'input':
            tpl = <OptionInput {...props} option={option} />
            break;
        case 'textarea':
            tpl = <OptionTextarea {...props} option={option} />
            break;
        case 'select':
            tpl = <OptionSelect {...props} option={option} />
            break;
        case 'checkbox':
            tpl = <OptionCheckbox {...props} option={option} />
            break;
        case 'color':
            tpl = <OptionColor {...props} option={option} />
            break;
        case 'switch':
            tpl = <OptionSwitch {...props} option={option} />
            break;
        case 'html':
            tpl = <OptionHTML {...props} option={option} />
            break;
        case 'shortcodes':
            tpl = <OptionShortCodes {...props} option={option} />
            break;
        case 'text':
            tpl = <OptionText {...props} option={option} />
            break;
    }
    if (title) {
        tpl = <>
            <h6>{title}</h6>
            {description ? description : ''}
            {tpl}
        </>
    }
    return (<div style={style} className={`oz_optionWrapper option-${option.name}`}>{tpl}<small class="text-muted text-italic px-1">{option.description}</small></div>);
}

const OptionText = ({ option }) => {
    return <div class={`ozplugin_optionText`}>{option.value}</div>
}

const OptionShortCodes = ({ option }) => {
    const shortcodes = option.values
    const [Filter, setFilter] = useState('')
    const onChange = (e) => {
        setFilter(e.target.value)
    }

    if (!shortcodes) return null


    if (Object.keys(shortcodes).length) {
        return (
            <div className="oz_repl-short-wrapper">
                <FormControl
                    onChange={onChange}
                    size="sm"
                    type="text" />
                {Object.entries(shortcodes)
                    .map((el, i) => {
                        const [show, setShow] = useState(false);
                        const target = useRef(null);
                        const Copy = (e) => {
                            selectText(e.target)
                            setShow(!show)
                            if (!show) {
                                setTimeout(() => {
                                    setShow(false)
                                }, 700)
                            }
                        }
                        let desc = el[1]['label'] ? el[1]['label'] : ''
                        if (Filter && el[0].toLowerCase().indexOf(Filter.toLowerCase()) < 0 && desc.toLowerCase().indexOf(Filter.toLowerCase()) < 0) {
                            return null
                        }

                        return <Row className="pb-2">
                            <Col xs="auto">
                                <small>
                                    <kbd ref={target} onClick={Copy} style={{ cursor: 'pointer' }}>{el[0]}</kbd>
                                    <Overlay target={target.current} show={show} placement="right">
                                        {(props) => {
                                            if (typeof props.style != 'undefined') {
                                                props.style.zIndex = 99999
                                            }
                                            return (
                                                <Tooltip id={`copied-tooltip-${i}`} {...props}>
                                                    {ozplugin_lang.copied}
                                                </Tooltip>
                                            )
                                        }}
                                    </Overlay>
                                </small>
                            </Col>
                            <Col><small className="text-muted">{el[1]['label']}</small></Col>
                        </Row>
                    })}
            </div>
        )
    }
    return null
}

const OptionSwitch = (props) => {
    const option = props.option
    const isToggle = option?.toggle || false
    const dispatch = useDispatch()
    const Ref = useRef()
    const saveOption = props.saveOption || saveOption

    const [Collapsed, setCollapsed] = useState('')

    const closeFields = () => {
        document.querySelectorAll('.oz_switch-toggle-' + option.name).forEach(el => {
            if (el.classList && el.classList.contains('oz_switch-toggle-hide')) {
                el.classList.remove('oz_switch-toggle-hide')
                setCollapsed('open')
            }
            else {
                el.classList.add('oz_switch-toggle-hide')
                setCollapsed('')
            }
        })
    }

    const Toggle = () => {
        let name = option.name
        let isDependent = false
        if (option?.values && option?.values.length && typeof option?.values[0].value == 'string') {
            isDependent = name
            name = name + "-" + option?.values[0].value
            if (Ref.current.checked) {
                [...document.querySelectorAll('input[name="' + isDependent + '"]')].forEach(el => {
                    if (el != Ref.current && el.checked) {
                        el.checked = false
                    }
                })
            }
        }
        dispatch({
            type: 'SET_SWITCHES',
            payload: {
                name,
                isDependent,
                checked: Ref.current.checked
            }
        })
        let value = Ref.current.checked
        let type = typeof Ref.current.checked
        if (isDependent) {
            name = isDependent,
                value = option?.values[0].value
            type = typeof option?.values[0].value
        }
        saveOption({
            name,
            value,
            type
        })
        if (option?.toggle) {
            closeFields()
        }
    }
    return (
        <>
            <Form.Check
                ref={Ref}
                type="switch"
                label=""
                defaultChecked={option.value}
                name={option.name}
                value={option.value}
                onChange={Toggle}
            />
            {option.description && <div className="text-muted oz_switch_desc form-switch"><small>{option.description}</small></div>}
            {(isToggle && (Ref.current && Ref.current.checked || option.value)) && <div onClick={closeFields} className={`switch-toggler ${Collapsed}`}><span className="dashicons dashicons-arrow-down-alt2" /></div>}
        </>
    )
}

const OptionHTML = (props) => {
    const option = props.option
    const loading = useSelector(state => state.loading)
    const onload = useSelector(state => state.app.onload)
    const [TinyChanging, setTinyChanging] = useState(false)
    const saveOption = props.saveOption || saveOption

    const parseForm = (e) => {
        e.target.classList.add('disabled')
        e.target.classList.add('oz_loading')
        let form = document.getElementById('oz_cust_fields_form')
        if (form) {
            let fields = [...form.elements].reduce((arr, el) => {
                let match = el.name.match(/oz_cust_fields\[(\d+)\]\[([a-z]+)\]/)
                if (typeof match[2] != 'undefined') {
                    if (typeof arr[match[1]] == 'undefined') arr[match[1]] = {}
                    if (typeof arr[match[1]][match[2]] == 'undefined') arr[match[1]][match[2]] = {}
                    arr[match[1]][match[2]] = el.value
                    if (match[2] == 'required' && typeof el.checked != 'undefined') {
                        arr[match[1]][match[2]] = el.checked ? el.value : false
                    }
                }
                return arr
            }, [])
            saveOption({
                'name': 'oz_cust_fields',
                'value': fields.length ? JSON.stringify(fields) : [],
                'type': typeof fields
            })
        }
    }

    const saveDrag = (e) => {
        let fields = e.detail
        saveOption({
            'name': option.name,
            'value': JSON.stringify(fields),
            'type': typeof fields
        })
    }

    const onChange = (e) => {
        let id = e.target.id
        if (!window.tinyMCE.get(id)) return
        if (TinyChanging) return
        setTinyChanging(true)
        saveOption({
            name: option.name,
            value: window.tinyMCE.get(id).getContent(),
            type: 'html',
        })
    }

    const onInput = (e) => {
        let id = e.target.dataset?.id
        if (!window.tinyMCE.get(id)) return
        if (TinyChanging) return
        setTinyChanging(true);
        saveOption({
            name: option.name,
            value: window.tinyMCE.get(id).getContent(),
            type: 'html',
        })
    }

    const onSetContent = (e) => {
        let id = e.target.id
        if (!window.tinyMCE.get(id)) return
        if (TinyChanging) return
        setTinyChanging(true)
        saveOption({
            name: option.name,
            value: window.tinyMCE.get(id).getContent(),
            type: 'html',
        })
    }

    const assignEditors = (id = 0) => {
        if (!id) return;
        if (typeof tinymce == 'undefined') return;
        if (!window.tinyMCE.get(id) && !window.tinyMCEPreInit.mceInit[id]) {
            return
        }
        else {
            if (!window.tinyMCE.get(id)) {
                if (navigator.userAgent.indexOf("Firefox") < 0) {
                    window.switchEditors.go(id, 'tmce')
                }
                tinymce.init(window.tinyMCEPreInit.mceInit[id])
            }
            else {

            }
        }

        window.tinyMCE.get(id).on('Change', onChange);
        window.tinyMCE.get(id).on('input', onInput);
        window.tinyMCE.get(id).on('SetContent', onSetContent);
    }

    useEffect(() => {
        if (!loading && TinyChanging) {
            setTinyChanging(false)
        }
    }, [loading])

    useEffect(() => {
        // todo don't needed this function
        if (option.name != 'oz_step_sequence') return;
        document.addEventListener('onDragChanged', saveDrag)
        return () => {
            document.removeEventListener('onDragChanged', saveDrag)
        }
    }, [])

    useEffect(() => {
        if (!document.querySelector('.oz_add_cust_fields') || option.name != 'cust_fields') return
        document.querySelector('.oz_add_cust_fields').addEventListener('click', parseForm)
        return () => {
            document.querySelector('.oz_add_cust_fields').removeEventListener('click', parseForm)
        }
    }, [])

    useEffect(() => {
        let isEditor = document.querySelector('.ozplugin_editor[name="' + option.name + '"]');
        if (!onload) return;
        if (!isEditor) return;
        assignEditors(isEditor.id)
    }, [onload])

    return (
        // changed option.value to option.code because option.value could be updated with saveOption function 
        <div dangerouslySetInnerHTML={{ __html: option?.code ? option.code : option.value }} />
    )
}

const OptionInput = (props) => {
    const option = props.option
    const [Timer, setTimer] = useState(false)
    const [Value, setValue] = useState(option.value)
    const [FirstRender, setFirstRender] = useState(true)
    const saveOption = props.saveOption || saveOption
    const Ref = useRef(null)
    const onChange = (e) => {
        setTimer(true)
        let name = e.target.name
        let value = e.target.value
        //setValue(value)
        let param = {
            name,
            value,
            type: typeof value
        }
        //saveOption(param)
    }

    const onBlur = () => {
        setTimer(false)
    }

    useEffect(() => {
        if (Timer) {
            setTimeout(() => {
                setTimer(false)
            }, 5000)
        }
        else {
            if (Ref.current.value != Value && !FirstRender) {
                setValue(Ref.current.value)
            }
        }

    }, [Timer])

    useEffect(() => {
        if (FirstRender) {
            setFirstRender(false)
            return;
        }
        let name = option.name
        let value = Value
        let param = {
            name,
            value,
            type: typeof value
        }
        saveOption(param)
    }, [Value])

    return (
        <FormControl
            name={option.name}
            defaultValue={option.value}
            ref={Ref}
            onChange={onChange}
            onBlur={onBlur}
            type="text" />
    )
}

const OptionTextarea = (props) => {
    const option = props.option
    const isHtml = option?.html
    const [Timer, setTimer] = useState(false)
    const [Value, setValue] = useState(option.value)
    const [FirstRender, setFirstRender] = useState(true)
    const saveOption = props.saveOption || saveOption
    const Ref = useRef(null)
    const onChange = (e) => {
        setTimer(true)
        let name = e.target.name
        let value = e.target.value
        //setValue(value)
        let param = {
            name,
            value,
            type: isHtml ? 'html' : typeof value
        }
        //saveOption(param)
    }

    const onBlur = () => {
        setTimer(false)
    }

    useEffect(() => {
        if (Timer) {
            setTimeout(() => {
                setTimer(false)
            }, 5000)
        }
        else {
            if (Ref.current.value != Value && !FirstRender) {
                setValue(Ref.current.value)
            }
        }

    }, [Timer])

    useEffect(() => {
        if (FirstRender) {
            setFirstRender(false)
            return;
        }
        let name = option.name
        let value = Value
        let param = {
            name,
            value,
            type: isHtml ? 'html' : typeof value
        }
        saveOption(param)
    }, [Value])

    return (
        <FormControl
            name={option.name}
            defaultValue={option.value}
            ref={Ref}
            onChange={onChange}
            onBlur={onBlur}
            as="textarea"
            rows={3}
        />
    )
}

const OptionSelect = (props) => {
    const option = props.option
    const options = option.values
    const saveOption = props.saveOption || saveOption
    const selectRef = useRef(null)
    let defValue = '';
    // 09/30/23 commented it. don't remember why should use this condition
    //if (option.value) {
    let find = options.filter(op => {
        let eq = typeof option.value == 'object' ? option.value.indexOf(op.value) > -1 : option.value == op.value
        return eq
    })
    if (find.length > 0)
        defValue = find
    //}

    const searchOptions = async (SearchWord) => {
        console.log(SearchWord, option)

        if (SearchWord && SearchWord.length > 2) {
            let res = await request({
                action: 'ozplugin_search',
                word: SearchWord,
                type: option.async,
            });
            console.log(res)
            if (res.success) {
                return res.payload
            }
        }
        return []
    }

    const CustomOption = ({ innerProps, isDisabled, label, value }) => {
        return (!isDisabled ?
            <div className={`react-select__option react-select__option-flag cursor-pointer`} {...innerProps}>
                <span className='react-tel-input'>
                    <div className={`flag ${value}`}></div>
                </span>
                <span>{label}</span>
            </div>
            : null)
    }

    let params = {}
    const isCountry = option.name == 'oz_tel_country' || option.name == 'oz_custom_tel_placeholder_flags'
    if (isCountry) {
        params.components = { Option: CustomOption }
    }

    const onChange = (e, option) => {
        let name = option.name
        let value = typeof e.value != 'undefined' ? e.value : e.map(v => v.value)
        let param = {
            name,
            value,
            type: typeof value
        }
        if (typeof value == 'object') {
            param.objectValuesType = typeof value[0]
        }
        saveOption(param)
    }

    useEffect(() => {
    }, [])

    if (option?.async) {
        return (
            <AsyncSelect
                cacheOptions
                defaultValue={defValue}
                isMulti={option.multiple}
                name={option.name}
                classNamePrefix="react-select"
                onChange={onChange}
                loadOptions={searchOptions}
                defaultOptions />
        )
    }


    return (
        <Select
            ref={selectRef}
            defaultValue={defValue}
            isMulti={option.multiple}
            options={options}
            name={option.name}
            classNamePrefix="react-select"
            onChange={onChange}
            {...params}
        />
    )
}

const OptionCheckbox = (props) => {
    const option = props.option
    const saveOption = props.saveOption || saveOption

    const onChange = (e) => {
        let name = e.target.name
        let value = e.target.checked
        let type = typeof value
        if (option.multiple && document.querySelectorAll('input[type="checkbox"][name="' + name + '"]')) {
            value = {};
            [...document.querySelectorAll('input[type="checkbox"][name="' + name + '"]')].forEach(el => {
                if (el.checked) {
                    value[el.value] = 1
                }
            })
            //value = value.join(',')
            type = typeof value
            value = JSON.stringify(value)
        }
        let param = {
            name,
            value,
            type
        }
        saveOption(param)
    }

    return (<>
        {option.values.map(check => {
            let defaultChecked = option.value
            if (option.multiple && option.value) {
                defaultChecked = typeof option.value == 'string' ? option.value.indexOf(check.value) > -1 : option.value
            }
            return (
                <FormCheck
                    label={check.label}
                    defaultChecked={defaultChecked}
                    name={option.name}
                    value={check.value}
                    onChange={onChange}
                    type="checkbox"
                />
            )
        })}
    </>

    )
}

const OptionColor = (props) => {
    const option = props.option
    const saveOption = props.saveOption || saveOption

    const onBlur = (e) => {
        let name = e.target.name
        let value = e.target.value
        let param = {
            name,
            value,
            type: typeof value
        }
        saveOption(param)
    }

    return (
        <Form.Control
            type="color"
            defaultValue={option.value}
            name={option.name}
            onBlur={onBlur}
        />
    )
}

const OptionRow = (props) => {
    const option = props.option
    const Switch = props?.Switch
    let isToggle = Switch && Switch?.toggle ? 'oz_switch-toggle-' + Switch.name : '';
    const description = sanitize(option.description, {
        allowedTags: ['a'],
        allowedAttributes: {
            'a': ['href', 'title']
        },
    });
    let isSwitchChild = '';
    const Ref = useRef(null)
    const activeSwitches = useSelector(state => state.app.switches)
    const displayType = option?.grid ? 'd-grid grid-columns-' + option?.grid : 'd-flex with-additional'
    if (Switch) {
        let name = Switch.name
        if (Switch?.values && Switch?.values.length && typeof Switch?.values[0].value == 'string') {
            name = name + "-" + Switch?.values[0].value
        }
        isSwitchChild = activeSwitches.indexOf(name) > -1 ? 'switchChild' : 'switchChild d-none'
    }

    useEffect(() => {
        if (isToggle)
            Ref.current.classList.add('oz_switch-toggle-hide')
    }, [])

    return (
        <ListGroupItem ref={Ref} className={`bg-transparent ${isToggle} ${option?.noborder ? 'border-0' : ''} ${isSwitchChild}`}>
            <Row>
                <Col md={option?.col ? option?.col : 5} className="option-label">
                    <h6>{option.title}</h6>
                    <p dangerouslySetInnerHTML={{ __html: description }} className="text-muted" />
                </Col>
                <Col className={`option-wrap flex-column flex-sm-row ${option.fields?.length > 1 ? displayType : ''}`}>
                    {option?.fields && option.fields.map(field => getField(field, props))}
                </Col>
            </Row>
        </ListGroupItem>
    )
}

export default function Option(props) {
    const option = props.option;
    let Switch = false;

    if (option.fields?.length == 1 && option.fields[0].type == 'switch') {
        Switch = option.fields[0]
    }

    return <>
        <OptionRow {...props} option={option} />
        {Switch && option.fields[0].fields.map(option => <OptionRow Switch={Switch} option={option} />)}
    </>
}