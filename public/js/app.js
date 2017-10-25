class TimersDashBoard extends React.Component {
    state = {
        timers:[],
    };

    componentDidMount() {
        this.loadTimersFromServer();
        setInterval(this.loadTimersFromServer, 5000);
    }

    loadTimersFromServer = () => {
        client.getTimers((serverTimers) => {
            this.setState({
                timers: serverTimers,
            });
        });
    };

    handleCreateFormSubmit = (e) =>{
        this.createTimer(e);
    };

    createTimer = (e) => {
        const t = helpers.newTimer(e);
        this.setState({
            timers: this.state.timers.concat(t),
        });

        client.createTimer(t);
    };

    handleEditFormSubmit = (obj) =>{
        this.updateTimer(obj);
    };

    updateTimer = (e) => {
        this.setState({
            timers: this.state.timers.map((timer) => {
                if(timer.id === e.id) {
                    return Object.assign({}, timer, {
                        title: e.title,
                        project: e.project,
                    });
                } else {
                    return timer;
                }
            }),
        });

        client.updateTimer(e);
    };

    handleDelete = (deleteId) => {
        this.deleteTimer(deleteId);
    };

    deleteTimer = (delId) => {
        this.setState({
            timers: this.state.timers.filter(timer => timer.id !== delId),
        });

        client.deleteTimer({
            id: delId,
        });
    };

    handleStopClick = (timerId) => {
        this.stopTimer(timerId);
    };

    //This startTimer is action from start button click
    startTimer = (id) => {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if(timer.id === id) {
                    return Object.assign({}, timer, {
                        runningSince: now,
                    });
                }else {
                    return timer;
                }
            }),
        });

        //This stopTimer is client.js startTimer
        client.startTimer({
            id: id,
            start: now,
        });
    };

    //This stopTimer is action from stop button click
    stopTimer = (id) => {
        const now = Date.now();
        this.setState({
            timers: this.state.timers.map((timer) => {
                if(timer.id === id) {
                    const lastElapsed = now - timer.runningSince;
                    return Object.assign({}, timer, {
                        elapsed: timer.elapsed + lastElapsed,
                        runningSince: null,
                    });
                } else {
                    return timer;
                }
            }),
        });
        //This stopTimer is client.js stopTimer
        client.stopTimer({
            id: id,
            stop: now,
        });
    };

    handleStartClick = (timerId) => {
        this.startTimer(timerId);
    };

    render() {
        return(
            <div className = "ui three column centered grid">
                <div className="column">
                    <EditableTimerList 
                        timers = {this.state.timers}
                        onFormSubmit={this.handleEditFormSubmit}
                        handleDelete={this.handleDelete}
                        onStartClick={this.handleStartClick}
                        onStopClick={this.handleStopClick} />
                    <TogglebleTimerForm 
                        isOpen={true}
                        onFormSubmit={this.handleCreateFormSubmit} />
                </div>
            </div>
        );
    }
}

class EditableTimerList extends React.Component {
    render() {
        const timers = this.props.timers.map((timer) =>(
            <EditableTimer
                key={timer.id}
                id={timer.id}
                title={timer.title}
                project={timer.project}
                elapsed={timer.elapsed}
                runningSince={timer.runningSince}
                onFormSubmit={this.props.onFormSubmit}
                handleDelete={this.props.handleDelete}
                onStartClick={this.props.onStartClick}
                onStopClick={this.props.onStopClick} />
        ));
        return(
            <div id="timers">
                { timers }
            </div>
        );
    }
}

class EditableTimer extends React.Component {
    state = {
        editFormOpen: false,
    };

    handleEditClick = () => {
        this.openForm();
    };

    openForm = () => {
        this.setState({
            editFormOpen: true,
        });
    };

    handleFormClose = () => {
        this.closeForm();
    };

    closeForm = () => {
        this.setState({
            editFormOpen: false,
        });
    };

    handleSubmit = (e) => {
        this.props.onFormSubmit(e);
        this.closeForm();
    };

    render() {
        if(this.state.editFormOpen){
            return(
                <TimerForm
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    onFormClose={this.handleFormClose}
                    onFormSubmit={this.handleSubmit} />
            );
        }
        else{
            return(
                <Timer
                    id={this.props.id}
                    title={this.props.title}
                    project={this.props.project}
                    elapsed={this.props.elapsed}
                    runningSince={this.props.runningSince}
                    onEditClick={this.handleEditClick}
                    onDeleteClick={this.props.handleDelete}
                    onStartClick={this.props.onStartClick}
                    onStopClick={this.props.onStopClick} />
            );
        }
    }
}

class TimerForm extends React.Component {
    state = {
        title: this.props.title || '',
        project: this.props.project || '',
    };

    handleTitleChange = (e) => {
        const title = e.target.value;
        this.setState({ title });
    };

    handleProjectChange = (e) => {
        const project = e.target.value;
        this.setState({ project });
    };

    handleSubmit = (e) =>{
        this.props.onFormSubmit({
            id: this.props.id,
            title: this.state.title,
            project: this.state.project,
        });
    };

    render() {
        const submitText = this.props.id ? 'Update' : 'Create';
        return(
            <div className="ui centered card">
                <div className="content">
                    <div className="ui form">
                        <div className="field">
                            <label>Title</label>
                            <input 
                                type="text" 
                                value={this.state.title}
                                onChange={this.handleTitleChange} />
                        </div>
                        <div className="field">
                            <label>Project</label>
                            <input 
                                type="text" 
                                value={this.state.project}
                                onChange={this.handleProjectChange} />
                        </div>
                        <div className="ui two bottom attached buttons">
                            <button
                             className="ui basic blue button"
                             onClick={this.handleSubmit} >
                                {submitText}
                            </button>
                            <button
                             className="ui basic red button"
                             onClick={this.props.onFormClose} >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

class TogglebleTimerForm extends React.Component {
    state={
        isOpen: false,
    };


    handleFormOpen = () => {
        this.setState({
            isOpen: true,
        });
    };

    handleFormClose = () => {
        this.setState({
            isOpen: false
        });
    };

    handleFormSubmit = (e) => {
        this.props.onFormSubmit(e);
        this.setState({isOpen: false});
    };

    render() {
        if(this.state.isOpen) {
            return(
                <TimerForm
                    onFormClose={this.handleFormClose}
                    onFormSubmit={this.handleFormSubmit} />
            );
        }
        else {
            return(
                <div className="ui basic content center aligned segment">
                    <button
                        className="ui basic button icon"
                        onClick={this.handleFormOpen}    >
                        <i className="icon plus"/>
                    </button>
                </div>
            );
        }
    }
}

class Timer extends React.Component {
    componentDidMount() {
        this.forceUpdateInterval = setInterval(() => this.forceUpdate(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.forceUpdateInterval);
    }

    handleStartClick = () => {
        this.props.onStartClick(this.props.id);
    };

    handleStopClick = () => {
        this.props.onStopClick(this.props.id);
    };

    onDeleteClick = () => {
            const val = confirm(`Are you sure you want to delete Timer?\nTitle: ${this.props.title}\nProject: ${this.props.project} `);
            if(val == true){
                this.props.onDeleteClick(this.props.id);
            }            
        };
        
    render() {
        const elapsedString = helpers.renderElapsedString(this.props.elapsed, this.props.runningSince);
        
        return(
            <div className="ui centered card">
                <div className="content">
                    <div className="header">
                        {this.props.title}
                    </div>
                    <div className="meta">
                        {this.props.project}
                    </div>
                    <div className="center aligned description">
                        <h2>
                            {elapsedString}
                        </h2>
                    </div>
                    <div className="extra content">
                        <span
                         className="right floated edit icon"
                         onClick={this.props.onEditClick} >
                            <i className="edit icon"/>
                        </span>
                        <span
                         className="right floated trash icon"
                         onClick={this.onDeleteClick} >
                            <i className="trash icon" />
                        </span>
                    </div>
                </div>
                <TimerActionButton
                timerIsRunning = {!!this.props.runningSince}
                onStartClick = {this.handleStartClick}
                onStopClick = {this.handleStopClick} />
            </div>
        );
    }
}

class TimerActionButton extends React.Component {
    render() {
        if (this.props.timerIsRunning) {
            return(
                <div
                    className ="ui bottom attached red basic button"
                    onClick={this.props.onStopClick} >
                    Stop
                </div>
            );
        }else {
            return(
                <div
                    className="ui bottom attached green basic button"
                    onClick={this.props.onStartClick} >
                    Start
                </div>
            );
        }
    }
}

ReactDOM.render(
    <TimersDashBoard />,
    document.getElementById('content')
);