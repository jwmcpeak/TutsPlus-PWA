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
        marked: [],
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
        },
        toggleComplete(task) {
            let newVal = !task.complete;

            if (!this.isOffline) {
                task.complete = newVal;
            } else {
                let index = this.marked.indexOf(task);

                if (index > -1) {
                    this.marked.splice(index, 1);
                } else {
                    this.marked.push(task);
                }
            }
        }
    };
})();