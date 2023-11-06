export default function app(state = {
    settings: [],
    activeTab: Object.keys(ozplugin_vars.settings.pages)[0] || 'settings',
    error: {error: false, text: ''},
    switches: [],
    loading: false,
    onload: false,
    popup: false,
    post: false,
    update_posts: false,
    need_update: false,
    filter: {},
},action) {
    switch(action.type) {
        case 'ONLOAD':  return {...state, onload: true} 
        case 'OPEN_POPUP':  return {...state, popup: true} 
        case 'CLOSE_POPUP':  return {...state, popup: false} 
        case 'SET_POST':  return {...state, post: action.payload} 
        case 'SET_FILTER':  return {...state, filter: action.payload} 
        case 'EDIT_POST':  return {...state, post: {...state.post, edit_post: action.payload}} 
        case 'DELETE_RESTORE_POST': 
        case 'DELETE_POST':  return {...state, popup: false, update_posts: true} 
        case 'UPDATE_POSTS':  return {...state, update_posts: action.payload, need_update: false} 
        case 'SET_POST_ID':  return {...state, post: {...state.post, id: action.payload}, update_posts: true} 
        case 'NEED_UPDATE':  return {...state, need_update: true} 
        case 'SET_SETTINGS':  return {...state, settings: action.payload} 
        case 'ERROR':  return {...state, error: {error: true, text: action.payload}} 
        case 'REMOVE_ERROR':  return {...state, error: {error: false, text: ''}} 
        case 'ACTIVE_TAB':  return {...state, activeTab: action.payload} 
        case 'LOADING':  return {...state, loading: action.payload} 
        case 'SET_SWITCHES':
            let newSwitches = []
            if (typeof action.payload.name != 'undefined') {
                    let name = action.payload.name
                    if (action.payload.checked) {
                        let isDependent = action.payload.isDependent;
                        if (isDependent) {
                            state.switches = state.switches.filter(e => e.indexOf(isDependent) < 0)
                        }
                        newSwitches = [...state.switches, name]
                    }
                    else {
                        newSwitches = state.switches.filter(el => el != name)
                    }
            }
            else {
                newSwitches = action.payload 
            }
            return {...state, switches: newSwitches}
        default: return state;
    }
}