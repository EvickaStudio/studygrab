import browser from 'webextension-polyfill';

let blockingEnabled = true;

browser.runtime.onMessage.addListener((request: { popupMounted: boolean, toggleBlocking: boolean }) => {
    if (request.popupMounted) {
        console.log('backgroundPage notified that Popup.tsx has mounted.');
    }

    if (request.toggleBlocking !== undefined) {
        blockingEnabled = request.toggleBlocking;
    }
});

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (blockingEnabled) {
            console.log(`Intercepted URL: ${details.url}`);
            fetch(details.url)
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'file';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(e => console.error(e));
            setTimeout(() => {
                blockingEnabled = false;
            }, 500);
        }
        // unblock
        // return { cancel: false };
        return { cancel: blockingEnabled };
    },
    { urls: ["*://*.studydrive.net/file-preview/*"] },
    ["blocking"]
);

browser.runtime.onMessage.addListener((request) => {
    if (request.toggleBlocking !== undefined) {
        blockingEnabled = request.toggleBlocking;
    }
});

// return blockingEnabled;
function getBlockingEnabled() {
    return blockingEnabled;
}

// toogleBlockingEnabled
function toggleBlockingEnabled() {
    blockingEnabled = !blockingEnabled;
}

export { getBlockingEnabled };
export { toggleBlockingEnabled };