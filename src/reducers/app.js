export default function app(state = {
    settings: [],
    activeTab: 'settings',
    error: {error: false, text: ''},
    switches: [],
    loading: false,
    onload: false,
},action) {
    switch(action.type) {
        case 'ONLOAD':  return {...state, onload: true} 
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