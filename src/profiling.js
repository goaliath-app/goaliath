/* Note: This profiler helpers can only be used in development mode, so their
measurements can be far from the results of the same experiments in production */

import React from 'react';

/* Hook to use as the first line of the body of a functional component. It will
print how much time passes between the hook call and the end of the render. 
Note: that does not mean this measures the time took to render, other sibling
components can be rendered in that time. */
export function useProfiling(name='Anonymous', verbose=false){
  const renderStartDate = Date.now()

  if(verbose){
    console.log(`took,    ,totl,    ,now,${renderStartDate},${name},'render start'`)
  }

  React.useEffect(() => {
    const renderEndDate = Date.now()
    const took = String(renderEndDate - renderStartDate).padStart(4)

    console.log(`took,${took},totl,${took},now,${renderEndDate},${name},render end`)
  })
}

/* Create to start timer. Use the mark method to print time elapsed to that
mark. Can use the mark method multiple times. */
export class Profiler {
  constructor(name='', verbose=false){
    this.name = name
    this.startDate = Date.now()
    this.lastDate = this.startDate

    if(verbose){
      console.log(`took,    ,totl,    ,now,${this.lastDate},${this.name},render start`)
    }
  }
  mark(markName){
    const now = Date.now()
    const took = String(now - this.lastDate).padStart(4)
    const total = String(now - this.startDate).padStart(4)
    console.log(`took,${took},totl,${total},now,${now},${this.name},${markName}`)
    this.lastDate = now
  }
}