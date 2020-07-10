window.projectList = (function () {

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').then(reg => {

            Notification.requestPermission(status => {
                if (status === 'granted') {
                    //new Notification('Howdy!');
                    //reg.showNotification('Hello, there')
                }
            })

            console.log('Successfully registered');
        }).catch(err => {
            console.log('Error while registering SW')
        });
    }
    
    function getDbValue() {
        return idbKeyval.get('changed').then(val => val || []);
    }

    function setDbValue(val) {
        return idbKeyval.set('changed', val);
    }

    function addToDb(id, complete) {
        return getDbValue().then(val => {
            val.push({id,complete});

            return setDbValue(val)
        });
    }

    function removeFromDb(id) {
        return getDbValue().then(val => {
            let index = val.findIndex(obj => obj.id == id);

            if (index > -1) {
                val.splice(index, 1);
            }

            return setDbValue(val)
        });
    }

    function displayCompleteNotification(task) {
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.getRegistration().then(reg => {
                let options = {
                    body: 'You completed a task!',
                    //icon: './path/to/image',
                    //vibrate: [100, 25,1000],
                    data: {
                        taskId: task.id
                    },
                    actions: [
                        {
                            action: 'incomplete',
                            title: 'Make task incomplete'
                        }
                    ]
                };
                reg.showNotification('Task Complete', options);
            });
        }
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

                if (newVal) {
                    displayCompleteNotification(task);
                }
            } else {
                let index = this.marked.indexOf(task);

                if (index > -1) {

                    removeFromDb(task.id)
                        .then(() => this.marked.splice(index, 1));

                } else {

                    addToDb(task.id, newVal)
                        .then(() => this.marked.push(task));

                }

                if ('SyncManager' in window) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.sync.register('sync-report');
                    });
                }
            }
        }
    };
})();