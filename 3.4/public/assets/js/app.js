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
        isOffline: false,
        init() {
            fetch('data.json').then(res => {
                if (res.headers.get('sw-cache')) {
                    this.isOffline = true;
                }

                return res.json();
            }).then(data => {
                this.tasks = data.tasks;
            });


            window.addEventListener('offline', e => {
                this.isOffline = true;
            });

            window.addEventListener('online', e => {
                this.isOffline = false;
            });
        }
    };
})();