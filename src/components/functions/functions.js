const request = async (params = {}) => {
    let body = new URLSearchParams();
    Object.entries(params).map(param => body.set(param[0], param[1]))
    body.set('_wpnonce', ozdon_vars.nonce)
    try {
    let res = await (await fetch(ozdon_vars.ajax_url, {
        method: 'post',
        body
    })).json()
    return res;
    }
    catch(err) {
        return err;
    }
}


function selectText(containerid) {
    if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(containerid);
        range.select();
		document.execCommand("copy");
        document.getSelection().removeAllRanges();
        document.selection.empty();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(containerid);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
		document.execCommand("copy");
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
          } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
          }
    }
}

export {request, selectText}