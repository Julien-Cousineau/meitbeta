const process = (data) => {
    
}

onmessage = (e) => {
    postMessage(process(e.data));
}