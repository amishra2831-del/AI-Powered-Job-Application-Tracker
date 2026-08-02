import { useContext } from 'react'
import { DarkModeContext } from '../context/DarkModeContext.jsx'

export const useDarkMode = () => useContext(DarkModeContext)