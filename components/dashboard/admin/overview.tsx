"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useEffect, useState } from "react"

// Data structure for the chart
interface DataPoint {
  name: string
  total: number
}

export function Overview() {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/revenue', {
          credentials: 'include', // Include cookies for authentication
        })
        const result = await response.json()
        // Check if result has the expected data property
        if (result && result.data) {
          setData(result.data)
        } else {
          console.error("Invalid response format:", result)
          setData(sampleData)
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error)
        // Use sample data if API call fails
        setData(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          formatter={(value: number) => [`$${value}`, 'Revenue']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Sample data in case the API call fails
const sampleData: DataPoint[] = [
  {
    name: "Jan",
    total: 1500,
  },
  {
    name: "Feb",
    total: 2300,
  },
  {
    name: "Mar",
    total: 2800,
  },
  {
    name: "Apr",
    total: 3200,
  },
  {
    name: "May",
    total: 2900,
  },
  {
    name: "Jun",
    total: 3500,
  },
  {
    name: "Jul",
    total: 4200,
  },
  {
    name: "Aug",
    total: 3800,
  },
  {
    name: "Sep",
    total: 4100,
  },
  {
    name: "Oct",
    total: 4600,
  },
  {
    name: "Nov",
    total: 5200,
  },
  {
    name: "Dec",
    total: 6100,
  },
] 