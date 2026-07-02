//
// HDX Algorithm Visualization Template File
//
// METAL Project
//
// Primary Authors: Gregory Drapeau
//

// This global variable refers to the object containaing all the
// necessary fields, functions, and states for a given AV.  This
// variable must be pushed to the this.avList in the hdxav.js file,
// and the file of this AV must be included in the index.php file
const hdxQHAV = {
    // short name for list of avs, will be used for the av= QS parameter value
    value: 'qhull',
    name: "Quickhull",
    description: "The divide and conquer algorithm for finding the convex hull.",

    // vertices, no edges
    useV: true,
    useE: false,
    
    currentSet: [],
    vOne: null,
    vTwo: null,
    // array of vertices that makes up the hull
    hullVertices: [],
    // array of the line segments that makes up the hull
    hullSegments: [],
    // dividing line slope
    slope: 0,
    // dividing line y-intercept
    yIntercept: 0,
    // sets
    sZero: [],
    sOne: [],
    sTwo: [],
    // max [distance, index, object]
    max: [],
    // used for splitLoop due to that being used in multiple places
    futureAction: "",
    // temporary vertices for swaping
    vOneTmp: null,
    vTwoTmp: null,
    // polyline object
    compLine: null,
    
    // elements index 0 is v1, index 1 is v2, index 2 is lower set
    recursionStack: [],

    // loop variable that tracks which point is currently being operated upon
    nextToCheck: -1,

    // The avActions array defines all of the actions of the AV
    avActions : [
        {
            label: "START",
            comment: "Initializes fields",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

                const sorter = new HDXWaypointsSorter();
                thisAV.currentSet = sorter.sortWaypoints();
                thisAV.vOne = thisAV.currentSet[0];
                thisAV.vTwo = thisAV.currentSet[thisAV.currentSet.length-1];
                thisAV.currentSet.splice(0,1);
                thisAV.currentSet.splice(thisAV.currentSet.length-1, 1);
                // dividing line
                thisAV.slope = (thisAV.vTwo.lat-thisAV.vOne.lat)/(thisAV.vTwo.lon-thisAV.vOne.lon);
                thisAV.yIntercept = (thisAV.slope*(thisAV.vOne.lon*(-1)))+thisAV.vOne.lat;
                let comLine = [];
                comLine[0] = [thisAV.vOne.lat, thisAV.vOne.lon];
                comLine[1] = [thisAV.vTwo.lat, thisAV.vTwo.lon];
                thisAV.compLine = L.polyline(comLine, visualSettings.visiting)
                thisAV.compLine.addTo(map);
                thisAV.hullVertices = [];
                thisAV.hullSegments = [];
                thisAV.hullVertices.push(thisAV.vOne);
                // AVCP updates
                document.getElementById("hVertsNum").innerText = thisAV.hullVertices.length;
            	let newTableRow = document.createElement("tr");
            	newTableRow.innerHTML = `<td style="background-color:white; color:black;">`+thisAV.hullVertices[thisAV.hullVertices.length-1].label+`</td>
            	<td style="background-color:white; color:black;">(`+thisAV.hullVertices[thisAV.hullVertices.length-1].lat+`, `+thisAV.hullVertices[thisAV.hullVertices.length-1].lon+`)</td>`;
        		document.getElementById("hullVertexTable").appendChild(newTableRow);
                thisAV.nextToCheck = -1;
                thisAV.futureAction = "callOne";
                hdxAVCP.update("hullv1", "v<sub>1</sub>: "+thisAV.vOne.label);
                hdxAVCP.update("hullv2", "v<sub>2</sub>: "+thisAV.vTwo.label);
                hdxAVCP.update("checkingLine", "Current line: y="+thisAV.slope+"x+"+thisAV.yIntercept+"<br>"+thisAV.vOne.label+"<-->"+thisAV.vTwo.label);
                updateMarkerAndTable(waypoints.indexOf(thisAV.vOne),
				 visualSettings.averageCoord, 40, false);
				updateMarkerAndTable(waypoints.indexOf(thisAV.vTwo),
				 visualSettings.averageCoord, 40, false);
                
                hdxAV.nextAction = "splitLoop";
            },
            logMessage: function(thisAV) {
                return "Doing some setup stuff";
            }
        },
        {
            label: "splitLoop",
            comment: "Loop for splitting up of vertices",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				thisAV.nextToCheck++;
				if(thisAV.nextToCheck < thisAV.currentSet.length){
					updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.visiting, 40, false);
					hdxAV.nextAction = "split";
				}else{
					hdxAV.nextAction = thisAV.futureAction;
				}
            },
            logMessage: function(thisAV) {
                return "Loop iteration: "+thisAV.nextToCheck;
            }
        },
        {
            label: "split",
            comment: "Splitting up vertices between set one and two",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				if(thisAV.vOne.lon < thisAV.vTwo.lon){
				// above hull
					if(thisAV.currentSet[thisAV.nextToCheck].lat > (thisAV.slope*thisAV.currentSet[thisAV.nextToCheck].lon+thisAV.yIntercept)){
						thisAV.sOne.push(thisAV.currentSet[thisAV.nextToCheck]);
						updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.discovered, 40, false);
					}else{
						thisAV.sTwo.push(thisAV.currentSet[thisAV.nextToCheck]);
						updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.discarded, 40, false);
					}
				}else{
				// below hull
					if(thisAV.currentSet[thisAV.nextToCheck].lat > (thisAV.slope*thisAV.currentSet[thisAV.nextToCheck].lon+thisAV.yIntercept)){
						thisAV.sTwo.push(thisAV.currentSet[thisAV.nextToCheck]);
						updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.discarded, 40, false);
					}else{
						thisAV.sOne.push(thisAV.currentSet[thisAV.nextToCheck]);
						updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.discovered, 40, false);
					}
				}
                
                hdxAV.nextAction = "splitLoop";
            },
            logMessage: function(thisAV) {
                return "Size of set one: "+thisAV.sOne.length+"<br>Size of set two: "+thisAV.sTwo.length;
            }
        },
        {
            label: "callOne",
            comment: "Adding to the recursion stack and setting up variables for first call",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);
                hdxAV.nextAction = "fnTop";

				if(thisAV.sOne.length > 0){
					let snapShot
					thisAV.currentSet = thisAV.sOne;
					if(thisAV.sTwo.length > 0){
						snapShot = [thisAV.vTwo, thisAV.vOne, thisAV.sTwo];
					}else{
						snapShot = [thisAV.vOne];
					}
					thisAV.recursionStack.push(snapShot);
				}else{
					thisAV.hullVertices.push(thisAV.vTwo);
					hdxQHAV.updateHullVertexTable();
					if(thisAV.sTwo.length > 0){
						let vZ = thisAV.vOne;
						thisAV.vOne = thisAV.vTwo;
						thisAV.vTwo = vZ;
						thisAV.currentSet = thisAV.sTwo;
					}else{
						hdxAV.nextAction = "cleanup";
					}
				}
                for(let i = 0; i < thisAV.sTwo.length ; i++){
                	updateMarkerAndTable(waypoints.indexOf(thisAV.sTwo[i]),
					 visualSettings.discovered, 40, false);
                }
                
                hdxAV.iterationDone = true;
            },
            logMessage: function(thisAV) {
                return "Starting at "+thisAV.vOne.label;
            }
        },
        {
            label: "fnTop",
            comment: "Setting up UI for new call and confirming vars have been reset",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				thisAV.nextToCheck = -1;
				thisAV.max = [0,-1,null];
				thisAV.sOne = [];
				thisAV.sTwo = [];
				// dividing line
				thisAV.slope = (thisAV.vTwo.lat-thisAV.vOne.lat)/(thisAV.vTwo.lon-thisAV.vOne.lon);
                thisAV.yIntercept = (thisAV.slope*(thisAV.vOne.lon*(-1)))+thisAV.vOne.lat;
                thisAV.compLine.remove();
                let comLine = [];
                comLine[0] = [thisAV.vOne.lat, thisAV.vOne.lon];
                comLine[1] = [thisAV.vTwo.lat, thisAV.vTwo.lon];
                thisAV.compLine = L.polyline(comLine, visualSettings.visiting)
                thisAV.compLine.addTo(map);
                
                // AVCP updates
                hdxAVCP.update("checkingLine", "Current line: y="+thisAV.slope+"x+"+thisAV.yIntercept+"<br>"+thisAV.vOne.label+"<-->"+thisAV.vTwo.label);
                hdxAVCP.update("hullv1", "v<sub>1</sub>: "+thisAV.vOne.label);
                hdxAVCP.update("hullv2", "v<sub>2</sub>: "+thisAV.vTwo.label);
                
                hdxAV.nextAction = "findMaxLoop";
            },
            logMessage: function(thisAV) {
                return "VOne: "+thisAV.vOne.label+" vTwo: "+thisAV.vTwo.label;
            }
        },
        {
            label: "findMaxLoop",
            comment: "Loop for finding the max",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				thisAV.nextToCheck++;
				if(thisAV.nextToCheck<thisAV.currentSet.length){
					hdxAV.nextAction = "findMax";
					updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.visiting, 40, false);
				}else{
					hdxAV.nextAction = "firstSplit";
				}

            },
            logMessage: function(thisAV) {
                return "Loop count "+thisAV.nextToCheck;
            }
        },
        {
            label: "findMax",
            comment: "Comparing current distance to previous max distance",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				let distance = hdxQHAV.distance();
				if(distance > thisAV.max[0]){
					if(thisAV.max[1] > -1){
						updateMarkerAndTable(waypoints.indexOf(thisAV.max[2]),
				    	 visualSettings.discovered, 40, false);
				     }
					thisAV.max = [distance, thisAV.nextToCheck, thisAV.currentSet[thisAV.nextToCheck]];
					updateMarkerAndTable(waypoints.indexOf(thisAV.max[2]),
				     visualSettings.averageCoord, 40, false);
				}else{
					updateMarkerAndTable(waypoints.indexOf(thisAV.currentSet[thisAV.nextToCheck]),
				     visualSettings.discovered, 40, false);
				}
                
                hdxAV.nextAction = "findMaxLoop";
            },
            logMessage: function(thisAV) {
                return "max distance is "+thisAV.max[0];
            }
        },
        {
            label: "firstSplit",
            comment: "Prepares the variables for the first split of the set",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				if(thisAV.max[2] != null){
					thisAV.vOneTmp = thisAV.vOne;
					thisAV.vTwoTmp = thisAV.max[2];
					// temporary line
					thisAV.slope = (thisAV.vTwoTmp.lat-thisAV.vOneTmp.lat)/(thisAV.vTwoTmp.lon-thisAV.vOneTmp.lon);
                	thisAV.yIntercept = (thisAV.slope*(thisAV.vOneTmp.lon*(-1)))+thisAV.vOneTmp.lat;
                	thisAV.compLine.remove();
                	let comLine = [];
                	comLine[0] = [thisAV.vOneTmp.lat, thisAV.vOneTmp.lon];
                	comLine[1] = [thisAV.vTwoTmp.lat, thisAV.vTwoTmp.lon];
                	thisAV.compLine = L.polyline(comLine, visualSettings.visiting)
                	thisAV.compLine.addTo(map);
					thisAV.nextToCheck = -1;
					thisAV.currentSet.splice(thisAV.max[1],1);
					thisAV.futureAction = "secondSplit";
					hdxAV.nextAction = "splitLoop";
				
					hdxAVCP.update("hullMax", "v<sub>max</sub>: "+thisAV.max[2].label);
					hdxAVCP.update("checkingLine", "Current line: y="+thisAV.slope+"x+"+thisAV.yIntercept+"<br>"+thisAV.vOneTmp.label+"<-->"+thisAV.vTwoTmp.label);
				}else{
					hdxAV.nextAction = "postSplits";
				}
            },
            logMessage: function(thisAV) {
                return "the line is y="+thisAV.slope+"x+"+thisAV.yIntercept;
            }
        },
        {
            label: "secondSplit",
            comment: "Prepares the variables for the second split of the set",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				thisAV.vOneTmp = thisAV.max[2];
				thisAV.vTwoTmp = thisAV.vTwo;
				// temporary line
				thisAV.slope = (thisAV.vTwoTmp.lat-thisAV.vOneTmp.lat)/(thisAV.vTwoTmp.lon-thisAV.vOneTmp.lon);
                thisAV.yIntercept = (thisAV.slope*(thisAV.vOneTmp.lon*(-1)))+thisAV.vOneTmp.lat;
                thisAV.compLine.remove();
                let comLine = [];
                comLine[0] = [thisAV.vOneTmp.lat, thisAV.vOneTmp.lon];
                comLine[1] = [thisAV.vTwoTmp.lat, thisAV.vTwoTmp.lon];
                thisAV.compLine = L.polyline(comLine, visualSettings.visiting)
                thisAV.compLine.addTo(map);
				thisAV.nextToCheck = -1;
				thisAV.sZero = thisAV.sOne;
				thisAV.currentSet = thisAV.sTwo;
				thisAV.sOne = [];
				thisAV.sTwo = [];
				thisAV.futureAction = "postSplits";
                hdxAV.nextAction = "splitLoop";
                
                hdxAVCP.update("checkingLine", "Current line: y="+thisAV.slope+"x+"+thisAV.yIntercept+"<br>"+thisAV.vOneTmp.label+"<-->"+thisAV.vTwoTmp.label);
            },
            logMessage: function(thisAV) {
                return "the line is y="+thisAV.slope+"x+"+thisAV.yIntercept;
            }
        },
        {
            label: "postSplits",
            comment: "Sets variables for the next iteration",
            code: function(thisAV) {
                highlightPseudocode(this.label, visualSettings.visiting);

				thisAV.sTwo = thisAV.sOne;
				thisAV.sOne = thisAV.sZero;
				hdxAV.nextAction = "fnTop";
                
                // checking if set one is empty
                if(thisAV.sOne.length > 0){
                	let snapShot;
                	// checking if set two is empty
                	if(thisAV.sTwo.length > 0){
                		snapShot = [thisAV.max[2], thisAV.vTwo, thisAV.sTwo];
                	}else{
                		snapShot = [thisAV.vTwo];
                	}
                	thisAV.currentSet = thisAV.sOne;
                	thisAV.vTwo = thisAV.max[2];
                	thisAV.recursionStack.push(snapShot);
                // checking if set two is empty
                }else if(thisAV.sTwo.length > 0){
                	thisAV.currentSet = thisAV.sTwo;
                	thisAV.vOne = thisAV.max[2];
                	thisAV.hullVertices.push(thisAV.max[2]);
                	hdxQHAV.updateHullVertexTable();
                // checking if recursion stack is empty
                }else if(thisAV.recursionStack.length > 0){
                	thisAV.hullVertices.push(thisAV.max[2]);
                	hdxQHAV.updateHullVertexTable();
                	thisAV.hullVertices.push(thisAV.vTwo);
                	hdxQHAV.updateHullVertexTable();
                	let snapShot = thisAV.recursionStack.pop();
                	// collect any of the single vertices in stack
                	while(snapShot?.length==1){
                		thisAV.hullVertices.push(snapShot[0]);
                		hdxQHAV.updateHullVertexTable();
                		snapShot = thisAV.recursionStack.pop();
                	}
                	// if stack is empty
                	if(snapShot==null){
                		hdxAV.nextAction = "cleanup";
                	}else{
                		thisAV.vOne = snapShot[0];
                		thisAV.vTwo = snapShot[1];
                		thisAV.currentSet = snapShot[2];
                	}
                // if stack is empty
                }else{
                	hdxAV.nextAction = "cleanup";
                	if(thisAV.max[2] != null){
                		thisAV.hullVertices.push(thisAV.max[2])
                		hdxQHAV.updateHullVertexTable();
                	}
                	thisAV.hullVertices.push(thisAV.vTwo);
                	hdxQHAV.updateHullVertexTable();
                }
                thisAV.sZero = [];
                thisAV.sOne = [];
                thisAV.sTwo = [];
                
                hdxAV.iterationDone = true;
                
                hdxAVCP.update("checkingLine", "Current line: y="+thisAV.slope+"x+"+thisAV.yIntercept+"<br>"+thisAV.vOne.label+"<-->"+thisAV.vTwo.label);
            },
            logMessage: function(thisAV) {
                return "Preparing for the next iteration";
            }
        },
        {
                label: "cleanup",
                comment: "cleanup and updates at the end of the visualization",
                code: function(thisAV) {
                    
                    hdxAVCP.update("hullv1", "");
                    hdxAVCP.update("hullv2", "");
                    hdxAVCP.update("hullMax", "");
                    hdxAVCP.update("checkingLine", "");
                    
                    thisAV.compLine.remove();
                    
                    hdxAV.nextAction = "DONE";
                    hdxAV.iterationDone = true;

                    
                },
                logMessage: function(thisAV) {
                    return "Cleanup and finalize visualization";
                }
        }
    ],
    
    // prepToStart is a required function which is called when you hit
    // visualize but before you hit start
    // sets up pseudocode
    prepToStart() {
	
        // Build HTML for the pseudocode, which is an HTML table, with
        // each state being a different row.
        this.code = '<table class="pseudocode"><tr id="START" class="pseudocode"><td class="pseudocode">';
        this.code += 'sortedPoints[] &larr; sort(waypoints)<br>westMost &larr; sortedPoints[0]<br>eastMost &larr; sortedPoints[this.length-1]<br>slope &larr; (v<sub>2</sub>.y - v<sub>1</sub>.y)/(v<sub>2</sub>.x - v<sub>1</sub>.x)<br>y-intercept &larr; (slope*v<sub>1</sub>.x*(-1))+y-intercept<br>s<sub>1</sub> &larr; split(sortedPoints, slope, y-intercept, +)<br>s<sub>2</sub> &larr; currentSet-s<sub>1</sub></td></tr>';
        this.code += pcEntry(0,["qHull(s<sub>1</sub>, westMost, eastMost)","qHull(s<sub>2</sub>, eastMost, westMost)"],"callOne");
        this.code += pcEntry(0, ["qHull(currentSet, v<sub>1</sub>, v<sub>2</sub>)", "&emsp;&emsp;if(currentSet.len==0)","&emsp;&emsp;&emsp;&emsp; return", "&emsp;&emsp;slope &larr; (v<sub>2</sub>.y - v<sub>1</sub>.y)/(v<sub>2</sub>.x - v<sub>1</sub>.x)", "&emsp;&emsp;y-intercept &larr; (slope*v<sub>1</sub>.x*(-1))+y-intercept", "max &larr; [0, point]"], "fnTop");
        this.code += pcEntry(1, "for (i &larr; 0 to |currentSet-1|","findMaxLoop");
        this.code += pcEntry(2, ["if max[0] < distance(v<sub>i</sub>)", "&emsp;&emsp;max &larr; [distance(v<sub>i</sub>)], v<sub>i</sub>"], "findMax")
        this.code += pcEntry(1, ["slope<sub>1</sub> &larr; (max[1].y - v<sub>1</sub>.y)/(max[1].x - v<sub>1</sub>.x)", "y-intercept<sub>1</sub> &larr; (slope*v<sub>1</sub>.x*(-1))+v<sub>1</sub>.y","s<sub>1</sub> &larr; split(currentSet, slope<sub>1</sub>, y-intercept<sub>1</sub>)"], "firstSplit");
        this.code += pcEntry(1, ["slope<sub>2</sub> &larr; (v<sub>2</sub>.y - max[1].y)/(v<sub>2</sub>.x - max[1].x)", "y-intercept<sub>2</sub> &larr; (slope*max[1].x*(-1))+max[1].y","s<sub>2</sub> &larr; split(currentSet, slope<sub>2</sub>, y-intercept<sub>2</sub>)"], "secondSplit");
        this.code += pcEntry(1, ["qHull(s<sub>1</sub>, v<sub>1</sub>, max[1])", "qHull(s<sub>2</sub>, max[1]) , v<sub>2</sub>"], "postSplits");
        this.code += pcEntry(0, ["split(set, slope, y-intercept)", "&emsp;&emsp;saves &larr; []", "&emsp;&emsp;for (i &larr; 0 to |set-1|)"], "splitLoop");
        this.code += pcEntry(2, ["if v<sub>i</sub>.y > slope*v<sub>i</sub>.x+y-intercept", "&emsp;&emsp;saves+=v<sub>i</sub>", " return saves"], "split");
        
    },
    // setupUI for quickhull av
    setupUI() {

        let newAO="";

        hdxAV.algOptions.innerHTML = newAO;
        
        // Setting up the AVCP with the elements that will be used
        hdxAVCP.add("hullv1", visualSettings.v1);
        hdxAVCP.add("hullv2", visualSettings.v2);
        hdxAVCP.add("hullMax", visualSettings.averageCoord);
        hdxAVCP.add("checkingLine", visualSettings.visiting);
        hdxAVCP.add("hullSegments", visualSettings.discovered);
        const hullSeg =`<span>Hull vertices found: <span id="hVertsNum">0</span></span>
        <table id="hullVertexTable" style="width:100%;"><tr><td style="background-color:white; color:black;"><b>Label</b></td><td style="background-color:white; color:black;"><b>Coordinates</b></td></tr></table>`;
        hdxAVCP.update("hullSegments", hullSeg);
    },
    // remove any changes made
    cleanupUI() {
        for(let i=0;i<this.hullSegments.length;i++){
        	this.hullSegments[i].remove();
        }
    },
	idOfAction(action) {
        return action.label;
    },
    
    // Calculates the distance from the current vertex to the line to which it is being compared
    distance(){
    	// finding line that is perpendicular to dividing line
    	let distSlope = ((this.vTwo.lon-this.vOne.lon)/(this.vTwo.lat-this.vOne.lat))*(-1);
    	let distYIntercept = this.currentSet[this.nextToCheck].lon*distSlope*(-1)+this.currentSet[this.nextToCheck].lat;
    	// finding coordinates of point on line
		let lonValue = (distYIntercept-this.yIntercept)/(this.slope-distSlope);
		let latValue = distSlope*lonValue+distYIntercept;
		return exactDistanceInMiles(latValue, lonValue, this.currentSet[this.nextToCheck].lat, this.currentSet[this.nextToCheck].lon)
    },
    
    // Adds vertices to the AVCP table and adds line segments to the hull when they are discovered
    updateHullVertexTable(){
    	// adding to table
    	if(this.hullVertices[0] != this.hullVertices[this.hullVertices.length-1]){
			document.getElementById("hVertsNum").innerText = this.hullVertices.length;
            let newTableRow = document.createElement("tr");
            newTableRow.innerHTML = `<td style="background-color:white; color:black;">`+this.hullVertices[this.hullVertices.length-1].label+`</td>
            <td style="background-color:white; color:black;">(`+this.hullVertices[this.hullVertices.length-1].lat+`, `+this.hullVertices[this.hullVertices.length-1].lon+`)</td>`;
        	document.getElementById("hullVertexTable").appendChild(newTableRow);
		}
		// adding to map hull segments
		let hullLine = [];
		hullLine[0] = [this.hullVertices[this.hullVertices.length-2].lat, this.hullVertices[this.hullVertices.length-2].lon];
		hullLine[1] = [this.hullVertices[this.hullVertices.length-1].lat, this.hullVertices[this.hullVertices.length-1].lon];
		this.hullSegments.push(L.polyline(hullLine, visualSettings.discovered));
		this.hullSegments[this.hullSegments.length-1].addTo(map);
    }
}