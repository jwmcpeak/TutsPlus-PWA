window.projectList = (function () {
    return {
        tasks: [],
        init() {
            fetch('data.json').then(res => res.json()).then(data => {
                this.tasks = data.tasks;
            });
        }
    };
})();