import { Renderable } from '@yearn-finance/web-lib/components/Renderable'
import React, { Key } from 'react'
import _TimeAgo, { Formatter, Suffix, Unit } from 'react-timeago'

function timeAgoFormatter (value: number, unit: Unit, suffix: Suffix, epochMiliseconds: number, nextFormatter: Formatter) {
	if(unit === 'second') {
		return 'moments ago'
	} else {
		return nextFormatter(value, unit, suffix, epochMiliseconds, nextFormatter)
	}
}

export default function TimeAgo({ 
  date, loading 
}: { 
  date?: Date | number, loading?: boolean 
}) {
	return <Renderable fallback={'****'} shouldRender={!loading}>
		<_TimeAgo key={date as Key} date={date || 0} minPeriod={60} formatter={timeAgoFormatter as Formatter} />
  </Renderable>
}
