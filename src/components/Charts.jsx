// Simple Chart Components using native SVG (no external dependencies)

export const PieChart = ({ data, size = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)

    if (total === 0) {
        return (
            <div className="flex items-center justify-center" style={{ width: size, height: size }}>
                <p className="text-zinc-500 text-sm">Sem dados</p>
            </div>
        )
    }

    let currentAngle = -90 // Start from top
    const radius = size / 2 - 10
    const centerX = size / 2
    const centerY = size / 2

    const slices = data.map((item, index) => {
        const percentage = (item.value / total) * 100
        const angle = (item.value / total) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle

        currentAngle = endAngle

        // Calculate path
        const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
        const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
        const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
        const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)

        const largeArc = angle > 180 ? 1 : 0

        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${startX} ${startY}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
            'Z'
        ].join(' ')

        return {
            path: pathData,
            color: item.color,
            label: item.label,
            value: item.value,
            percentage: percentage.toFixed(1)
        }
    })

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width={size} height={size} className="transform -rotate-0">
                {slices.map((slice, index) => (
                    <g key={index}>
                        <path
                            d={slice.path}
                            fill={slice.color}
                            className="transition-opacity hover:opacity-80 cursor-pointer"
                        />
                    </g>
                ))}
            </svg>
            <div className="flex flex-wrap gap-3 justify-center">
                {slices.map((slice, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: slice.color }}
                        />
                        <span className="text-xs text-zinc-400">
                            {slice.label}: {slice.value} ({slice.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1)

    return (
        <div className="space-y-4">
            {data.map((item, index) => {
                const percentage = (item.value / maxValue) * 100

                return (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-400">{item.label}</span>
                            <span className="font-semibold text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: item.color
                                }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        yellow: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
        red: 'from-red-500/20 to-rose-500/20 border-red-500/30'
    }

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur border p-6 rounded-2xl relative overflow-hidden group`}>
            {Icon && (
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon size={64} />
                </div>
            )}
            <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-4xl font-bold mt-2">{value}</p>
            {subtitle && <p className="text-zinc-500 text-xs mt-1">{subtitle}</p>}
        </div>
    )
}

export const TrendIndicator = ({ value, label }) => {
    const isPositive = value > 0
    const isNeutral = value === 0

    return (
        <div className="flex items-center gap-2">
            {!isNeutral && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    <span>{isPositive ? '↑' : '↓'}</span>
                    <span>{Math.abs(value)}%</span>
                </div>
            )}
            <span className="text-zinc-500 text-sm">{label}</span>
        </div>
    )
}
