window.projectList = (function () {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {
            console.log('Successfully registered');
        }).catch(err => {
            console.log('Error while registering SW')
        });
    }

    return {
        tasks: [],
        init() {
            fetch('data.json').then(res => res.json()).then(data => {
                this.tasks = data.tasks;
            });
        }
    };
})();