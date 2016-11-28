import React from 'react';
import { Link } from 'react-router';

const Join = React.createClass({

  join(){
    let memberName = this.refs.name.value;
    this.props.emit('join', { name: memberName });
  },

  render(){
    return (
      <form action='javascript:void(0)' onSubmit={this.join}>

        <label>Full Name</label>
        <input ref='name'
               className='form-control'
               placeholder='enter your full name...'
               required />
        <button className='btn btn-primary'>Join</button>

        <Link to="/Speaker">Join as speaker</Link>
        <Link to="/Board">Go to the board</Link>
      </form>
    )
  }

});

module.exports = Join;
