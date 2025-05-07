"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const NotificationSystem = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (!session) return

    // This would be replaced with your actual notification fetching logic
    const fetchNotifications = async () => {
      try {
        // Example API call to get notifications
        // const response = await fetch('/api/notifications')
        // const data = await response.json()
        // setNotifications(data)

        // For now, we'll use dummy data
        if (session.user.role === "customer") {
          setNotifications([
            {
              id: 1,
              message: "Your booking request for Convention Center A has been accepted",
              date: new Date(),
              read: false,
            },
            {
              id: 2,
              message: "Your booking for Convention Center B has been cancelled by the vendor",
              date: new Date(Date.now() - 86400000), // 1 day ago
              read: false,
            },
          ])
        } else {
          setNotifications([
            {
              id: 1,
              message: "New booking request from John Doe",
              date: new Date(),
              read: false,
            },
          ])
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications
    const interval = setInterval(fetchNotifications, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [session])

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(notification.date).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t text-center">
            <button className="text-sm text-blue-600 hover:underline">Mark all as read</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationSystem
