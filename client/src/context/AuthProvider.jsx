import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMe, logoutUser } from '../api/auth.js'
import { AuthContext } from './AuthContext.jsx'

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await getMe()
        return res.data.user
      } catch {
        return null
      }
    },
  })

  const logout = async () => {
    await logoutUser()
    queryClient.setQueryData(['user'], null)
    queryClient.clear()
  }

  return (
    <AuthContext.Provider value={{ user: data, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}