function setBackgroundColor( element, toast_type) {
    const toast = element;
    if (toast_type === 'error') {
        toast.style.backgroundColor = 'red';
    } else if (toast_type === 'warning') {
        toast.style.backgroundColor = 'orange';
    } else if (toast_type === 'success') {
        toast.style.backgroundColor = 'green';
    } else if(toast_type === 'info') {
        toast.style.backgroundColor = '#1976D2';
    }
}

export function showToast(toast_type, message = '') {
    const body = document.body
    const new_div = document.createElement('div')
    new_div.id = 'toast'
    new_div.innerHTML = '<span style="margin-top: 5px; margin-right: 2px">'+message+'</span>';
    new_div.className = "show";
    body.appendChild(new_div)

    const icon = document.createElement('img')
    icon.id = "icon"
    icon.src = require('/src/assets/icon/'+toast_type+'.png')
    icon.alt = toast_type
    icon.style.marginRight = '5px'
    document.getElementById('toast').appendChild(icon)

    setBackgroundColor(new_div, toast_type);

    // After 3 seconds, remove the show class from DIV
    setTimeout(function () {
        new_div.className = new_div.className.replace("show", "");
        document.body.removeChild(new_div)
    }, 3000);
}