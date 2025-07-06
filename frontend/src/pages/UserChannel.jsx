import React, { useEffect } from 'react'
import { AuthLayout, Channel } from '../components'
import { useParams } from 'react-router-dom'

const UserChannel = () => {

    const {username} = useParams();

    return (
        <div>
            <Channel key={username}/>
        </div>
    )
}

export default UserChannel