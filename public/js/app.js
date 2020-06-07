



class TimerDashboard extends React.Component{

  constructor(props){
    super(props)
    this.state = {

        timers:[]
    };
  }

  handleCreateFormSubmit = (timer) =>{
    this.createTimer(timer);
  }
  createTimer = (timer) => {
    const t = helpers.newTimer(timer);

    client.createTimer(t)

    this.setState({
      timers:this.state.timers.concat(t)
    })
  }

  handleUpdateFormSubmit = (timer) => {
    this.updateTimer(timer);
  }

  updateTimer = (timer) =>{
    const updated_timers = this.state.timers.map(timers => {
      if (timers.id === timer.id){
        timers.title = timer.title
        timers.project = timer.project
        return timers
      }
      else{
        return timers
      }
    })

    helpers.findById(updated_timers,timer.id,(ele)=>{
       
      client.updateTimer(ele)

    })

    this.setState({timers:updated_timers})
  }


  handleDeleteTimer = (timerId) =>{

    this.removeTimerFromServer(timerId)
    
  }

  removeTimerFromServer = (timerId)=>{
    const newTimers = this.state.timers.filter(element =>{
      if(element.id !== timerId){
        return element
      }
    })
    helpers.findById(this.state.timers,timerId,(ele)=>{
        client.deleteTimer(ele)  

     })
    this.setState({timers:newTimers})
  }
  
  Timer_Started = (timerId) =>{
    this.UpdateElapsed(timerId)
  }

  Timer_Stopped = (timerId) =>{
    this.UpdateRunningSince(timerId)
  }

  UpdateRunningSince = (timerId) => {
    const now = Date.now()
    this.setState({timers:this.state.timers.map(ele=>{
      if(ele.id === timerId){
        const lastelapsed = now - ele.runningSince
        return Object.assign({},ele,{elapsed:ele.elapsed+lastelapsed,runningSince:null})
      }
      else{
        return ele
      }
    })})

    helpers.findById(this.state.timers,timerId,(ele)=>{

      const data = {id:ele.id,stop:now}
      client.stopTimer(data)

    })
  }



  UpdateElapsed = (timerId) =>{
    const now = Date.now()
    this.setState({timers:this.state.timers.map(ele =>{
      if (ele.id === timerId){
        return Object.assign({},ele,{runningSince:now})
      }
      else{
        return ele
      }
    })
    }
    )
    helpers.findById(this.state.timers,timerId,(ele)=>{
      const data = {id:ele.id,start:now}
      client.startTimer(data)


  })
  }





  componentDidMount(){
    client.getTimers((Servertimers)=>{

      this.setState({timers:Servertimers})
    })
  }

  render(){
    return(
      <div className = 'ui three column centered grid'>
        <div className = 'column'>
        <EditableTimerList
        timers ={this.state.timers}
        onFormSubmit = {this.handleUpdateFormSubmit}
        DeleteTimer = {this.handleDeleteTimer}
        Timer_Started = {this.Timer_Started}
        Timer_Stopped = {this.Timer_Stopped}
        />
        <ToggleableTimerForm
          handleFormSubmit = {this.handleCreateFormSubmit}
          />
        </div>
        </div>

    )
  }

}
class ToggleableTimerForm extends React.Component{
  constructor (props){
    super(props)
    this.state = {
      isOpen:false
  }
  }
  formOpen =(val) =>{
    this.setState({isOpen:true})

  }

  isFormOpen = () =>{
    if (this.state.isOpen){
      this.setState({isOpen:false})
    }
    else{
      this.setState({isOpen:true})
    }
  }

  onFormSubmit = (ele) => {
    this.props.handleFormSubmit(ele)
    this.setState({isOpen:false})
    
  }
    
  render(){
    if (this.state.isOpen === false){
      return (
      <div className = 'ui basic content center aligned segment'>
      <button className ='ui basic button icon'onClick ={this.formOpen}>
        <i className ='plus icon'/>
      </button>
    </div>)
    }else{
      return (
        <TimerForm
        form = {this.isFormOpen}
        onSubmit = {this.onFormSubmit}
        />
      )
    }
  }
}

class EditableTimerList extends React.Component{

  constructor(props){
    super(props)

  }

  render(){
    let AlreadySetTimers = this.props.timers.sort((a,b)=>{
      b.elapsed - a.elapsed
    })
    console.log(AlreadySetTimers)
    const AllTimers = AlreadySetTimers.map(ele =>{
      return <EditableTimer
            key = {'timer-'+ele.id}
            id = {ele.id}
            title = {ele.title}
            project = {ele.project}
            timer = {ele.elapsed}
            UpdateTimer = {this.props.onFormSubmit}
            removeTimerDashboard = {this.props.DeleteTimer}
            runningSince = {ele.runningSince}
            Timer_Started = {this.props.Timer_Started}
            Timer_Stopped = {this.props.Timer_Stopped}
           />
    })
    return(
      <div id = 'timers'>
        {AllTimers}
         
      </div>
    )
  }
}

class EditableTimer extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      editFormOpen:false
    }

  }

  UpdateTimerForm = (ele) =>{
    this.props.UpdateTimer(ele)
    this.setState({editFormOpen:false})
  }

  isFormOpen = () =>{
    this.setState({editFormOpen:true})
  }
  closeForm = ()=>{
    this.setState({editFormOpen:false})
  }

  render(){
    if (this.state.editFormOpen){
      return(
        <TimerForm
        id ={this.props.id}
        title = {this.props.title}
        project = {this.props.project}
        form = {this.isFormOpen}
        onCancel = {this.closeForm}
        onSubmit = {this.UpdateTimerForm}
        
        />
      )
    }else{
      return(
        <Timer
        id = {this.props.id}
        title = {this.props.title}
        project = {this.props.project}
        timer = {this.props.timer}
        runningSince = {this.props.runningSince}
        onSubmit = {this.props.onSubmit}
        form = {this.isFormOpen}
        removeTimer = {this.props.removeTimerDashboard}
        Timer_Started = {this.props.Timer_Started}
        Timer_Stopped = {this.props.Timer_Stopped}
        />
      )

    }
  }

}
class TimerForm extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      title:this.props.title || '',
      project:this.props.project || ''
    }
  }

  create_update_timer = (text) =>{
    this.props.onSubmit({
      id:this.props.id,
      title:this.state.title,
      project:this.state.project
    })
  }
  updateProject =(e)=>{
    this.setState({project:e.target.value})
  }
  updateTitle = (e) =>{
    this.setState({title:e.target.value})
  }

  render(){

    const submitText = this.props.id ? 'Update':'Create'
    return(
      <div className = 'ui centered card'>
        <div className = 'content'>
        <div className = 'ui form'>
          <div className = 'field'>
            <label>Title</label>
            <input type = 'text' value={this.state.title} onChange={this.updateTitle}/>
          </div>
          <div className = 'field'>
            <label>Project</label>
            <input type = 'text' value={this.state.project} onChange={this.updateProject}/>
          </div>
          <div className = 'ui two bottom attached buttons'>
            <button className ='ui basic blue button' onClick ={this.create_update_timer}>
                {submitText}
            </button>
            <button className ='ui basic red button'onClick ={this.props.onCancel}>
                Cancel
            </button>
          </div>
        </div>

      </div>

      </div>

    )

  }
}

class Timer extends React.Component{
  constructor(props){
    super(props)
  }

  startTimer = ()=>{

      this.props.Timer_Started(this.props.id)
    
  }

  stopTimer = ()=>{

    this.props.Timer_Stopped(this.props.id)
  }



  componentDidMount(){
    this.forceUpdateInterval = setInterval(() => this.forceUpdate(),50)
  }

  componentWillUnmount(){
    clearInterval(this.forceUpdateInterval)
  }

  deleteTimer =() => {
    this.props.removeTimer(this.props.id)
  }

  updateForm = () =>{
    this.props.form()
  }

  render(){
    const elapsedString = helpers.renderElapsedString(this.props.timer,this.props.runningSince)
    return(
  <div className='ui centered card'>
    <div className='content'>
      <div className='header'> 
      
      {this.props.title}

      </div>
      <div className='meta'> {this.props.project}
      </div>
      <div className='center aligned description'>
        <h2>
          {elapsedString}
          </h2> 
      </div>
      <div className='extra content'>
        <span className='right floated edit icon' onClick = {this.updateForm}>
          <i className='edit icon' />
        </span>
        <span className='right floated trash icon' onClick = {this.deleteTimer}>
          
            <i className='trash icon' />
         
        </span>
      </div>
    </div>
    <TimerButton
    runningSince = {this.props.runningSince}
    startTimer = {this.startTimer}
    stopTimer ={this.stopTimer}

    />
  </div>

    )
  }
}

class TimerButton extends React.Component {
  constructor(props){
    super(props)
 
  }
  startButton= () =>{
  
    this.props.startTimer()
  }
  stopButton = () =>{
    
    this.props.stopTimer()
  }

  render(){
    if (this.props.runningSince){
      return(
        <div className='ui bottom attached blue basic button' onClick = {this.stopButton}>
         Stop
      </div>)
    }else{
    return(
      <div className='ui bottom attached blue basic button' onClick = {this.startButton}>
        Start
    </div>)
    }
  
  }
}


ReactDOM.render(<TimerDashboard/>,document.getElementById('content'))
