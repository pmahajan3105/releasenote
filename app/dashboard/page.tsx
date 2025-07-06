import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, TrendingUpIcon, UsersIcon, FileTextIcon, CalendarIcon, SettingsIcon } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data for dashboard stats
  const stats = [
    {
      title: "Published Notes",
      value: "24",
      change: "+12%",
      icon: <FileTextIcon className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Total Views",
      value: "12,484",
      change: "+23%",
      icon: <TrendingUpIcon className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Active Readers",
      value: "1,823",
      change: "+8%",
      icon: <UsersIcon className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Scheduled",
      value: "3",
      change: "0%",
      icon: <CalendarIcon className="w-6 h-6" />,
      trend: "neutral"
    }
  ]

  // Mock recent release notes
  const recentNotes = [
    {
      id: 1,
      title: "Mobile App Performance Improvements",
      status: "published",
      date: "2024-01-15",
      views: 1247,
      category: "improvement"
    },
    {
      id: 2,
      title: "New Dashboard Analytics Features",
      status: "draft",
      date: "2024-01-12",
      views: 0,
      category: "feature"
    },
    {
      id: 3,
      title: "Security Updates and Bug Fixes",
      status: "scheduled",
      date: "2024-01-20",
      views: 0,
      category: "security"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'feature': return 'bg-purple-100 text-purple-800'
      case 'improvement': return 'bg-blue-100 text-blue-800'
      case 'security': return 'bg-red-100 text-red-800'
      case 'bugfix': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex flex-col gap-8 pt-8 pb-12 px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#101828] mb-2">
            Dashboard
          </h1>
          <p className="text-[#667085]">
            Overview of your release notes and performance metrics
          </p>
        </div>
        <Link href="/release-notes/create">
          <Button className="bg-[#7F56D9] text-white hover:bg-[#6941C6]">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Release Note
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-[#e4e7ec]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#667085] mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-[#101828]">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-[#667085] ml-1">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="text-[#667085]">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Release Notes */}
        <Card className="border-[#e4e7ec]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-[#101828]">
              Recent Release Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-[#101828] mb-1">
                      {note.title}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-[#667085]">
                      <Badge className={`text-xs ${getStatusColor(note.status)}`}>
                        {note.status}
                      </Badge>
                      <Badge className={`text-xs ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </Badge>
                      <span>{note.date}</span>
                      {note.views > 0 && (
                        <span>• {note.views.toLocaleString()} views</span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href="/release-notes">
                <Button variant="outline" className="w-full">
                  View All Release Notes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-[#e4e7ec]">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-[#101828]">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link href="/release-notes/create">
                <Button variant="outline" className="w-full justify-start h-12">
                  <PlusIcon className="w-4 h-4 mr-3" />
                  Create New Release Note
                </Button>
              </Link>
              <Link href="/release-notes/draft">
                <Button variant="outline" className="w-full justify-start h-12">
                  <FileTextIcon className="w-4 h-4 mr-3" />
                  Continue Draft
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="outline" className="w-full justify-start h-12">
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Configure Integrations
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full justify-start h-12">
                  <TrendingUpIcon className="w-4 h-4 mr-3" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 