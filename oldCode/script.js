// Add these global variables at the very top of the file
let favoriteEvents = {
    yellow: new Set(),
    orange: new Set(),
    red: new Set()
};
let showingOnlyFavorites = {
    yellow: false,
    orange: false,
    red: false
};
let eventLongPressTimer;
const eventLongPressDuration = 500;

// Add these variables with your other globals
let isRandomizing = false;
let randomizeInterval;
const initialInterval = 50; // Start fast (50ms)
const finalInterval = 500; // End slow (500ms)
const randomizeDuration = 2000; // Total duration of randomization (2 seconds)

// Process the data to extract year, month, and day
ufo_events = ufo_events.map(event => {
    const [month, day, year] = event.date.split(' ');
    return {
        ...event,
        year: parseInt(year),
        month,
        day: parseInt(day),
        key: event.category // Use category as the key
    };
});

const HIGHLIGHT_YELLOW = "#ffff00";

let categories = [
    "Major Events", "Tech", "Military Contact",
    "Abduction", "Beings", "Interaction", "Sighting", "Mass Sighting", "High Strangeness", "Community"
];

function getCategoryColor(category, isHover = false) {
    const isHighContrast = document.body.classList.contains('high-contrast');
    const baseColors = {
        "High Strangeness": "#1BE3FF",
        "Mass Sighting": "#37C6FF",
        "Sighting": "#52AAFF",
        "Interaction": "#6E8EFF",
        "Beings": "#8971FF",
        "Abduction": "#A555FF",
        "Military Contact": "#C039FF",
        "Tech": "#DC1CFF",
        "Major Events": "#F700FF",
        "Community": "#00E3AD", // New color for Community
    };

    const hoverColors = {
        "High Strangeness": "#5FEBFF",
        "Mass Sighting": "#6FD4FF",
        "Sighting": "#7CBFFF",
        "Interaction": "#94AAFF",
        "Beings": "#AB95FF",
        "Abduction": "#BE7FFF",
        "Military Contact": "#D26EFF",
        "Tech": "#E55DFF",
        "Major Events": "#F94DFF",
        "Community": "#4DFFC4", // Hover color for Community
    };

    const highContrastColors = {
        "Major Events": "#FF0000",
        "Tech": "#00FF00",
        "Military Contact": "#0000FF",
        "Abduction": "#FFFF00",
        "Beings": "#FF00FF",
        "Interaction": "#00FFFF",
        "Sighting": "#FF8000",
        "Mass Sighting": "#8000FF",
        "High Strangeness": "#FFFFFF",
        "Community": "#00FF80", // High contrast color for Community
    };

    if (isHighContrast) {
        return highContrastColors[category];
    } else {
        return isHover ? hoverColors[category] : baseColors[category];
    }
}

const margin = {top: 30, right: 50, bottom: 30, left: 200};
const width = window.innerWidth - margin.left - margin.right;
const height = 420 - margin.top - margin.bottom; // Increased by 20px
const eventBoxWidth = 60; // Increased by 20%
const eventBoxHeight = 30;

let globeSvg, projection, path, globeZoom;
let showAllEvents = true;
let rotation = [0, 0, 0];

const craftTypes = [
    "Orb", "Lights", "Saucer", "Sphere", "Triangle", "Cylinder",
    "V-Shaped", "Tic Tac", "Diamond", "Cube", "Cube in Sphere", "Egg", "Oval", "Bell",  "Organic", "Other"
];
let activeCraftTypes = new Set();

const entityTypes = [
    "None Reported", "Grey", "Mantid", "Reptilian", "Tall Grey",
    "Tall White", "Nordic", "Robotic", "Humanoid", "Human",
    "Female Entity", "Other"
];
let activeEntityTypes = new Set();

let searchInput;
let activeCategories = new Set(categories);

let selectedEvent = null;
let isSearchMode = false;

// Add this variable at the top of your script, with your other global variables
let currentSearchTerm = '';

// Update the performSearch function
function performSearch() {
    currentSearchTerm = document.querySelector('#search-input').value.toLowerCase().trim();

    // Get the current zoom state
    const currentTransform = d3.zoomTransform(d3.select("#timeline svg").node());
    const currentXScale = currentTransform.rescaleX(x);

    if (currentSearchTerm === '') {
        // When search is cleared, use the original ufo_events dataset
        updateEvents(currentXScale, ufo_events);
        updateDonutChart(ufo_events);
        updateAllEventPoints(ufo_events);
    } else {
        const filteredEvents = ufo_events.filter(event => 
            event.title.toLowerCase().includes(currentSearchTerm) ||
            event.detailed_summary.toLowerCase().includes(currentSearchTerm) ||
            event.category.toLowerCase().includes(currentSearchTerm) ||
            event.craft_type.toLowerCase().includes(currentSearchTerm) ||
            event.entity_type.toLowerCase().includes(currentSearchTerm) ||
            event.city.toLowerCase().includes(currentSearchTerm) ||
            event.state.toLowerCase().includes(currentSearchTerm) ||
            event.country.toLowerCase().includes(currentSearchTerm)
        );
        
        updateEvents(currentXScale, filteredEvents);
        updateDonutChart(filteredEvents);
        updateAllEventPoints(filteredEvents);
    }
}

// Add this new function to filter events
function filterEvents(events, searchTerm) {
    return events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.detailed_summary.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm) ||
        event.craft_type.toLowerCase().includes(searchTerm) ||
        event.entity_type.toLowerCase().includes(searchTerm)
    );
}

function calculateEventScore(event) {
    return (parseFloat(event.credibility) || 0) + (parseFloat(event.notoriety) || 0);
}

function zoomToDecade(decade) {
    const startDate = new Date(decade, 0, 1);
    const endDate = new Date(decade + 10, 0, 1);
    
    const [x0, x1] = x.domain();
    const [X0, X1] = x.range();
    
    const k = (X1 - X0) / (x(endDate) - x(startDate));
    const tx = -x(startDate);

    d3.select("#timeline svg").transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.scale(k).translate(tx, 0)
    );
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateTimeline() {
    const currentTransform = d3.zoomTransform(d3.select("#timeline svg").node());
    const currentXScale = currentTransform.rescaleX(x);

    // Update category row visibility
    svg.selectAll(".category-row-timeline")
        .attr("opacity", d => activeCategories.has(d) ? 0.1 : 0);

    svg.selectAll(".category-row-padding, .category-row-padding-bottom")
        .attr("opacity", d => activeCategories.has(d) ? 0.2 : 0);

    // Update events
    updateEvents(currentXScale);
}

// Add these variables at the top of your file with other global variables
let globeRotationInterval;
let isGlobeInteracted = false;

// Add these variables at the top with other globe-related variables
let initialTouchDistance = 0;
let currentTouchScale = 1;

// Add this function to handle touch events for pinch-zoom
function initGlobeTouchEvents() {
    const globeElement = document.getElementById('globe-container');
    
    globeElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    globeElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    globeElement.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(event) {
    if (event.touches.length === 2) {
        event.preventDefault();
        // Calculate initial distance between touch points
        initialTouchDistance = getTouchDistance(event.touches);
        stopGlobeRotation();
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 2) {
        event.preventDefault();
        const currentDistance = getTouchDistance(event.touches);
        const scale = currentDistance / initialTouchDistance;
        
        // Calculate new scale based on pinch gesture
        let newScale = currentTouchScale * scale;
        
        // Limit zoom range
        newScale = Math.min(Math.max(newScale, 1), 8);
        
        // Apply zoom
        const center = [
            parseFloat(globeSvg.attr("width")) / 2,
            parseFloat(globeSvg.attr("height")) / 2
        ];
        
        globeZoom.scaleTo(globeSvg.transition().duration(50), newScale, center);
        
        currentTouchScale = newScale;
        hideTooltip();
    }
}

function handleTouchEnd(event) {
    if (event.touches.length < 2) {
        initialTouchDistance = 0;
    }
}

function getTouchDistance(touches) {
    return Math.hypot(
        touches[1].clientX - touches[0].clientX,
        touches[1].clientY - touches[0].clientY
    );
}

// Update the initGlobe function to include touch events
function initGlobe() {
    const globeContainer = document.getElementById('globe-container');
    const size = Math.min(globeContainer.offsetWidth, globeContainer.offsetHeight);

    globeSvg = d3.select("#globe-container")
        .append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr("viewBox", `0 0 ${size} ${size}`)
        .style("background-color", "transparent");

    const g = globeSvg.append("g");

    g.append("circle")
        .attr("cx", size / 2)
        .attr("cy", size / 2)
        .attr("r", size / 2 - 2)
        .attr("fill", "rgba(0, 0, 0, 0.3)")
        .attr("stroke", "#0ff")
        .attr("stroke-width", 0);

    projection = d3.geoOrthographic()
        .scale(size / 2 - 2)
        .translate([size / 2, size / 2])

    path = d3.geoPath().projection(projection);

    globeZoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    globeSvg.call(globeZoom);

    let dragBehavior = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    globeSvg.call(dragBehavior);
    globeSvg.call(globeZoom);

    let lastMousePosition;

    function dragstarted(event) {
        lastMousePosition = [event.x, event.y];
        stopGlobeRotation();
        fadeOutEventPoint();
        hideTooltip();
    }
    
    function dragged(event) {
        let dx = event.x - lastMousePosition[0];
        let dy = event.y - lastMousePosition[1];
        
        // Get current zoom scale
        const transform = d3.zoomTransform(globeSvg.node());
        const scale = transform.k || currentTouchScale;
        
        // Adjust sensitivity based on zoom level
        const sensitivity = 0.5 / scale; // Reduce sensitivity as zoom increases
        
        rotation[0] += dx * sensitivity;
        rotation[1] -= dy * sensitivity;
        
        projection.rotate(rotation);
        
        g.selectAll("path").attr("d", path);
        updateAllEventPoints();
        
        lastMousePosition = [event.x, event.y];
        fadeOutEventPoint();
        hideTooltip();
    }
    
    function dragended() {
        // You can add any necessary end-of-drag behavior here
        hideTooltip();
    }

    function zoomed(event) {
        const {transform} = event;
        g.attr("transform", transform);
        g.attr("stroke-width", 1 / transform.k);
        adjustEventPointSize();
        hideTooltip();
        
        // Remove any favorite overlays smoothly
        d3.selectAll('.favorite-overlay')
            .classed('fade-out', true)
            .transition()
            .duration(300)
            .remove();
    }

    // Create a globe with wireframe look
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function(world) {
        const countries = topojson.feature(world, world.objects.countries);

        // Add graticule (latitude/longitude grid)
        const graticule = d3.geoGraticule();
        
        g.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "#FFA500")  // Changed to orange
            .attr("stroke-width", 0.5)
            .attr("stroke-opacity", 0.5);

        g.append("path")
            .datum({type: "Sphere"})
            .attr("class", "sphere")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "#FFA500")  // Changed to orange
            .attr("stroke-width", 1.5);

        g.selectAll(".country")
            .data(countries.features)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", path)
            .attr("fill", "none")
            .attr("stroke", "#FFA500")  // Changed to orange
            .attr("stroke-width", 0.5);

        // Initialize all event points
        updateAllEventPoints();
    });

    // Start the globe rotation
    startGlobeRotation();

    // Add event listeners to stop rotation on interaction
    globeSvg.on("mousedown", stopGlobeRotation);
    globeSvg.on("touchstart", stopGlobeRotation);

    createGlobeCategoryToggles();
    updateGlobeCategoryToggles();

    // Add this line to create the reset button
    addResetGlobeButton();

    // Add this line at the end of the function
    initGlobeTouchEvents();
}

// Add these new functions
function startGlobeRotation() {
    if (!isGlobeInteracted) {
        globeRotationInterval = setInterval(() => {
            rotation[0] += 0.5; // Adjust rotation speed as needed
            projection.rotate(rotation);
            globeSvg.selectAll("path").attr("d", path);
            updateAllEventPoints();
        }, 50); // Adjust interval for smoother or faster rotation
    }
}

function stopGlobeRotation() {
    isGlobeInteracted = true;
    clearInterval(globeRotationInterval);
}

// Find the existing clearEventDetails function and replace it with this updated version
function clearEventDetails() {
    // Clear event details content
    document.getElementById("event-content").innerHTML = "";
    
    // Remove event point and pulse from globe
    updateGlobe(null, null);

    // Remove hover effect from all category toggles
    removeAllCategoryToggleHoverEffects();

    // Remove highlight from all category rows
    svg.selectAll(".category-row-timeline")
        .classed("highlighted", false);

    // Clear toggle highlights
    document.querySelectorAll('.craft-type-button, .entity-type-button').forEach(button => {
        button.classList.remove('relevant');
    });

    // Reset globe rotation
    isGlobeInteracted = false;
    startGlobeRotation();

    // Disable deep dive button
    const deepDiveBtn = document.getElementById("switch-container-btn");
    deepDiveBtn.disabled = true;
    deepDiveBtn.style.opacity = "0.5";
}

// Add these new functions to handle category toggle hover effects
function triggerCategoryToggleHoverEffect(category) {
    // Remove hover effect from all toggles first
    removeAllCategoryToggleHoverEffects();

    // Find the toggle for the selected category and trigger hover effect
    const toggle = document.querySelector(`.globe-category-toggle[data-category="${category}"]`);
    if (toggle) {
        toggle.classList.add('selected');
        const categoryName = toggle.querySelector('.globe-category-name');
        categoryName.style.maxWidth = '150px';
        categoryName.style.opacity = '1';
        categoryName.style.marginLeft = '10px';
    }
}

function removeAllCategoryToggleHoverEffects() {
    const allToggles = document.querySelectorAll('.globe-category-toggle');
    allToggles.forEach(toggle => {
        toggle.classList.remove('selected');
        const categoryName = toggle.querySelector('.globe-category-name');
        categoryName.style.maxWidth = '0';
        categoryName.style.opacity = '0';
        categoryName.style.marginLeft = '0';
    });
}

// Update the existing selectEvent function
function selectEvent(d, clickedElement) {
    const selectedGroup = clickedElement ? d3.select(clickedElement.parentNode) : d3.select(`.event-group[data-id="${d.category}-${d.date}-${d.time}"]`);
    const isCurrentlySelected = selectedGroup.classed('selected');

    // Remove highlight from all category rows
    svg.selectAll(".category-row-timeline")
        .classed("highlighted", false);

    // First, reset all event groups to default state
    timelineGroup.selectAll(".event-group")
        .each(function() {
            const group = d3.select(this);
            // Move circle to front
            group.select('.event-circle').raise();
        });

    // If clicking on the currently selected event, toggle its state
    if (isCurrentlySelected) {
        selectedGroup.classed('selected', false);
        selectedGroup.select('.event-circle').style("display", "block");
        selectedGroup.select('.event-rect').style("display", "none");
        selectedGroup.select('.event-text-container').style("display", "none");
        selectedEvent = null;
        clearEventDetails();
        removeAllCategoryToggleHoverEffects();
    } else {
        // If selecting a new event, handle the selection
        selectedGroup.classed('selected', true);
        
        // Bring the rectangle and text to front for the selected event
        selectedGroup.select('.event-rect')
            .style("display", "block")
            .raise();
        selectedGroup.select('.event-text-container')
            .style("display", "block")
            .raise();
        selectedGroup.select('.event-circle')
            .style("display", "none");

        selectedEvent = d;
        updateEventDetails(d);
        triggerCategoryToggleHoverEffect(d.category);

        // Highlight the category row of the selected event
        svg.select(`.category-row-timeline[data-category="${d.category}"]`)
            .classed("highlighted", true);

        // Update navigation buttons when selecting a new event
        if (d) {
            updateNavigationButtons(d);
        }
    }

    isSearchMode = false;
    stopGlobeRotation();
}

const svg = d3.select("#timeline")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const currentYear = new Date().getFullYear();
const x = d3.scaleTime()
    .domain([new Date(1800, 0, 1), new Date(currentYear + 1, 0, 1)])
    .range([0, width]);

const y = d3.scaleBand()
    .domain(categories)
    .range([0, height])
    .padding(0.2);

const xAxis = (interval) => {
    let axis = d3.axisBottom(x);
    if (interval < 1) {
    } else if (interval < 1) {
        axis.ticks(d3.timeYear.every(1)) // Show every year
            .tickFormat(d3.timeFormat("%Y"));
    } else if (interval < 10) {
        axis.ticks(d3.timeYear.every(5)) // Show every 5 years
            .tickFormat(d3.timeFormat("%Y"));
    } else {
        axis.ticks(d3.timeYear.every(10)) // Show every 10 years
            .tickFormat(d3.timeFormat("%Y"));
    }
    return axis;
};

function makeDecadesClickable() {
    gX.selectAll(".tick")
        .filter(d => d.getFullYear() % 10 === 0)
        .select("text")
        .style("cursor", "pointer")
        .on("click", (event, d) => zoomToDecade(d.getFullYear()));
}

// Create a clip path
svg.append("defs")
   .append("clipPath")
   .attr("id", "clip")
   .append("rect")
   .attr("x", 0)
   .attr("y", 0)
   .attr("width", width)
   .attr("height", height);

// Adjust the width of category buttons
const buttonWidth = margin.left - 5;

function createCategoryButtons() {
    const categoryButtons = svg.selectAll(".category-button")
        .data(categories)
        .enter()
        .append("g")
        .attr("class", "category-button")
        .attr("data-category", d => d)
        .attr("transform", d => `translate(${-margin.left}, ${y(d)})`)
        .style("cursor", "pointer")
        .on("mousedown", startLongPress)
        .on("mouseup", handleMouseUp)
        .on("mouseleave", clearLongPress)
        .on("click", handleClick);

    // Adjust rectangle for each category button
    categoryButtons.append("rect")
        .attr("width", buttonWidth)
        .attr("height", y.bandwidth() - 4)
        .attr("rx", 12)
        .attr("ry", 12)
        .attr("fill", "rgba(0, 0, 0, 0.2)")
        .attr("stroke", d => getCategoryColor(d))
        .attr("stroke-width", 2);

    // Adjust category labels position
    categoryButtons.append("text")
        .attr("class", "category-label")
        .attr("x", 15) // Move text slightly more to the right
        .attr("y", y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "white")
        .attr("font-weight", "bold")
        .style("text-transform", "uppercase")
        .style("pointer-events", "none")
        .text(d => d);

    // Adjust indicator position
    categoryButtons.append("circle")
        .attr("class", "category-indicator")
        .attr("cx", buttonWidth - 15) // Position circle near the right edge of the button
        .attr("cy", y.bandwidth() / 2)
        .attr("r", 5)
        .attr("fill", "white")
        .attr("opacity", 1);

    // Add hover effects
    categoryButtons.on("mouseover", function(event, d) {
        d3.select(this).select("rect")
            .transition()
            .duration(200)
            .attr("fill", d => getCategoryColor(d, true))
            .attr("stroke", d => getCategoryColor(d, true));
        
        d3.select(this).select("text")
            .transition()
            .duration(200)
            .attr("fill", d => getCategoryColor(d, true));
    })
    .on("mouseout", function(event, d) {
        d3.select(this).select("rect")
            .transition()
            .duration(200)
            .attr("fill", "rgba(0, 0, 0, 0.2)")
            .attr("stroke", d => getCategoryColor(d));
        
        d3.select(this).select("text")
            .transition()
            .duration(200)
            .attr("fill", "white");
    });
}

let longPressTimer;
let isLongPress = false;
const longPressDuration = 500; // 500ms for long press

function startLongPress(event, category) {
    event.preventDefault(); // Prevent text selection
    isLongPress = false;
    
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        soloCategory(category);
    }, longPressDuration);
}

function handleMouseUp(event, category) {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function clearLongPress() {
    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }
}

function handleClick(event, category) {
    if (!isLongPress) {
        toggleCategory(event, category);
    }
    clearLongPress();
    isLongPress = false;
}

// Add this new function to handle soloing a category
function soloCategory(category) {
    // Turn off all categories except the selected one
    activeCategories = new Set([category]);
    
    // Update button states
    svg.selectAll(".category-button")
        .select(".category-indicator")
        .attr("opacity", d => activeCategories.has(d) ? 1 : 0);

    // Update button stroke opacity
    svg.selectAll(".category-button")
        .select("rect")
        .transition()
        .duration(200)
        .attr("stroke-opacity", d => activeCategories.has(d) ? 1 : 0.3);

    // Update visualizations
    updateTimeline();
    updateDonutChart();
    updateAllEventPoints();
}

// Remove the showCategoryModal function and related code since we're not using it anymore

// Call createCategoryButtons instead of the existing category button creation code
createCategoryButtons();

// Add category rows over timeline with lower opacity
svg.selectAll(".category-row-timeline")
   .data(categories)
   .enter()
   .append("rect")
   .attr("class", "category-row-timeline")
   .attr("data-category", d => d)
   .attr("x", 0)  // Left side stays at 0
   .attr("y", d => y(d))
   .attr("width", width - 50)
   .attr("height", y.bandwidth())
   .attr("fill", d => getCategoryColor(d))
   .attr("opacity", 0.1)
   .attr("rx", 15)
   .attr("ry", 15);

// Create a group for the timeline content with clip-path
const timelineGroup = svg.append("g")
    .attr("clip-path", "url(#clip)");

const gX = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis(5)); // Start with 5-year intervals

makeDecadesClickable();

// Add border between categories and timeline
svg.append("line")
   .attr("x1", 0)
   .attr("y1", 0)
   .attr("x2", 0)
   .attr("y2", height)
   .attr("stroke", "black")
   .attr("stroke-width", 2);

// Find the existing zoom definition and update it
const zoom = d3.zoom()
   .scaleExtent([.5, 75])
   .extent([[0, 0], [width, height]])
   .on("zoom", zoomed)
   .filter(event => {
       return !event.target.closest('#color-scheme-toggle');
   });

// Add this new function to set initial zoom
function setInitialZoom() {
    const startDate = new Date(1940, 0, 1);
    const endDate = new Date(1970, 11, 31);
    
    const [x0, x1] = x.domain();
    const [X0, X1] = x.range();
    
    const k = (X1 - X0) / (x(endDate) - x(startDate));
    const tx = -x(startDate);

    d3.select("#timeline svg")
        .call(zoom.transform, d3.zoomIdentity.scale(k).translate(tx, 0));
}

d3.select("#timeline svg")
   .call(zoom)
   .on("dblclick.zoom", null); // Disable double-click zooming

ufo_events = ufo_events.filter(event => 
    !isNaN(+event.longitude) && !isNaN(+event.latitude)
);

// Add this function to handle toggle highlighting
function highlightRelevantToggles(event) {
    // Clear previous highlights
    document.querySelectorAll('.craft-type-button, .entity-type-button').forEach(button => {
        button.classList.remove('relevant');
    });

    // Highlight relevant craft types
    const craftTypes = event.craft_type.split(', ');
    craftTypes.forEach(type => {
        const button = document.querySelector(`.craft-type-button[data-type="${type}"]`);
        if (button) {
            button.classList.add('relevant');
        }
    });

    // Highlight relevant entity types
    const entityTypes = event.entity_type.split(', ');
    entityTypes.forEach(type => {
        const button = document.querySelector(`.entity-type-button[data-type="${type}"]`);
        if (button) {
            button.classList.add('relevant');
        }
    });
}

// Update the createCraftTypeButtons function
function createCraftTypeButtons() {
    const container = document.getElementById('craft-type-toggles');
    craftTypes.forEach(craftType => {
        const button = document.createElement('button');
        button.textContent = craftType;
        button.classList.add('craft-type-button');
        button.setAttribute('data-type', craftType); // Add this line
        button.addEventListener('click', () => toggleCraftType(craftType, button));
        container.appendChild(button);
    });
}

// Update the createEntityTypeButtons function
function createEntityTypeButtons() {
    const container = document.getElementById('entity-type-toggles');
    entityTypes.forEach(entityType => {
        const button = document.createElement('button');
        button.textContent = entityType;
        button.classList.add('entity-type-button');
        button.setAttribute('data-type', entityType); // Add this line
        button.addEventListener('click', () => toggleEntityType(entityType, button));
        container.appendChild(button);
    });
}

function toggleCraftType(craftType, button) {
    if (activeCraftTypes.has(craftType)) {
        activeCraftTypes.delete(craftType);
        button.classList.remove('active');
    } else {
        activeCraftTypes.add(craftType);
        button.classList.add('active');
    }
    updateTimeline();
    updateAllEventPoints();
    updateDonutChart();
}

function toggleEntityType(entityType, button) {
    if (activeEntityTypes.has(entityType)) {
        activeEntityTypes.delete(entityType);
        button.classList.remove('active');
    } else {
        activeEntityTypes.add(entityType);
        button.classList.add('active');
    }
    updateTimeline();
    updateAllEventPoints();
    updateDonutChart();
}

// Update the zoomed function
function zoomed(event) {
    const newX = event.transform.rescaleX(x);
    const extent = newX.domain();
    const years = extent[1].getFullYear() - extent[0].getFullYear();
    const pixelsPerYear = width / years;

    let interval;
    if (pixelsPerYear > 50) interval = 0.5;
    else if (pixelsPerYear > 15) interval = 5;
    else interval = 10;

    gX.call(xAxis(interval).scale(newX));
    makeDecadesClickable();

    // Remove any favorite overlays with fade animation
    d3.selectAll('.favorite-overlay')
        .classed('fade-out', true)
        .transition()
        .duration(300)
        .remove();

    // Use the current search term to filter events
    const filteredEvents = currentSearchTerm ? filterEvents(ufo_events, currentSearchTerm) : ufo_events;
    updateEvents(newX, filteredEvents);
    drawFavoriteConnections(newX); // Add this line to update connections
    hideTooltip();
}

// Remove the duplicate declaration of updateEvents and update the existing one


let currentScrollerIndex = 0;
let isScrollerAnimating = false;
let lastDownX = 0;
let lastDownY = 0;

function updateTopScroller() {
    if (typeof topScrollerItems === 'undefined' || topScrollerItems.length === 0) {
        return;
    }

    if (isScrollerAnimating) {
        return;
    }

    isScrollerAnimating = true;

    const scrollerElement = document.getElementById('top-scroller');
    const currentLink = scrollerElement.querySelector('a');
    const nextItem = topScrollerItems[currentScrollerIndex];

    const newLink = document.createElement('a');
    newLink.href = nextItem.link;
    newLink.target = "_blank";
    newLink.rel = "noopener noreferrer";
    newLink.innerHTML = `
        <span class="scroller-message">${nextItem.message}</span>
    `;
    newLink.classList.add('scrolling-in');

    if (currentLink) {
        currentLink.classList.add('scrolling-out');
        currentLink.addEventListener('animationend', () => {
            currentLink.remove();
            scrollerElement.appendChild(newLink);
        }, { once: true });
    } else {
        scrollerElement.appendChild(newLink);
    }

    newLink.addEventListener('animationend', () => {
        newLink.classList.remove('scrolling-in');
        isScrollerAnimating = false;
    }, { once: true });

    currentScrollerIndex = (currentScrollerIndex + 1) % topScrollerItems.length;
}
    // Clear the interval and set it again to ensure consistent timing
  function resetTopScrollerInterval() {
    clearInterval(topScrollerInterval);
     topScrollerInterval = setInterval(updateTopScroller, 10000);
}

// Initial setup
let topScrollerInterval = setInterval(updateTopScroller, 10000);
updateTopScroller(); // Initial update

// Reset the interval every full cycle
setInterval(() => {
        resetTopScrollerInterval();
}, 10000 * topScrollerItems.length);


function hasDeepDiveContent(event) {
    if (!event.deep_dive_content) return false;
    
    // Check each content type
    const contentTypes = ['Images', 'Videos', 'Reports', 'News Coverage'];
    return contentTypes.some(type => {
        const content = event.deep_dive_content[type];
        return content && content.length > 0;
    });
}

function updateEvents(xScale, customDataset = null) {
    const dataset = customDataset || ufo_events;
    let visibleEvents = dataset.filter(d => 
        activeCategories.has(d.category) &&
        (activeCraftTypes.size === 0 || d.craft_type.split(', ').some(type => activeCraftTypes.has(type))) &&
        (activeEntityTypes.size === 0 || d.entity_type.split(', ').some(type => activeEntityTypes.has(type)))
    );

    // Filter for favorites if any color toggle is active
    if (Object.values(showingOnlyFavorites).some(isActive => isActive)) {
        visibleEvents = visibleEvents.filter(d => {
            const eventId = `${d.category}-${d.date}-${d.time}`;
            return Object.entries(showingOnlyFavorites).some(([color, isActive]) => 
                isActive && favoriteEvents[color] && favoriteEvents[color].has && favoriteEvents[color].has(eventId)
            );
        });
    }

    visibleEvents.sort((a, b) => calculateEventScore(b) - calculateEventScore(a));

    // Update vertical lines
    const eventLines = timelineGroup.selectAll(".event-line")
        .data(visibleEvents, d => `${d.category}-${d.date}-${d.time}`);

    eventLines.enter()
        .append("line")
        .attr("class", "event-line")
        .merge(eventLines)
        .attr("x1", d => xScale(new Date(d.year, getMonthIndex(d.month), d.day)))
        .attr("y1", d => y(d.category) + y.bandwidth() / 2)
        .attr("x2", d => xScale(new Date(d.year, getMonthIndex(d.month), d.day)))
        .attr("y2", height)
        .attr("stroke", d => getCategoryColor(d.category))
        .attr("stroke-width", 1)
        .attr("pointer-events", "none");

    eventLines.exit().remove();

    // Update event groups
    const eventGroups = timelineGroup.selectAll(".event-group")
        .data(visibleEvents, d => `${d.category}-${d.date}-${d.time}`);

    // Remove old event groups
    eventGroups.exit().remove();

    // Create new event groups
    const eventGroupsEnter = eventGroups.enter()
        .append("g")
        .attr("class", "event-group")
        .attr("data-id", d => `${d.category}-${d.date}-${d.time}`)
        .on("mousedown touchstart", handleEventLongPress)
        .on("mouseup touchend mouseleave touchcancel", handleEventPressEnd);

    // Create the event box group for new events
    const eventBoxGroup = eventGroupsEnter.append("g")
        .attr("class", "event-box-group")
        .style("cursor", "pointer")
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip)
        .on("click", handleEventClick);

    // Add circle, rect, and text container to new events
    eventBoxGroup.append("rect")
        .attr("class", "event-rect")
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("width", eventBoxWidth)
        .attr("height", eventBoxHeight)
        .attr("x", -eventBoxWidth / 2)
        .attr("y", -eventBoxHeight / 2)
        .attr("fill", "black")
        .attr("stroke", d => getCategoryColor(d.category))
        .attr("stroke-width", 2)
        .style("display", "none");

    eventBoxGroup.append("foreignObject")
        .attr("class", "event-text-container")
        .attr("width", eventBoxWidth)
        .attr("height", eventBoxHeight)
        .attr("x", -eventBoxWidth / 2)
        .attr("y", -eventBoxHeight / 2)
        .style("display", "none")
        .html(d => `<div style="color: white; font-size: 7px; font-weight: bold; word-wrap: break-word; overflow: hidden; text-overflow: ellipsis; display: flex; justify-content: center; align-items: center; text-align: center; height: 100%; padding: 0 2px; text-transform: uppercase;">${d.title.toUpperCase()}</div>`);

    eventBoxGroup.append("circle")
        .attr("class", "event-circle")
        .attr("r", 5)
        .attr("fill", "black") // Changed from conditional fill to always black
        .attr("stroke", d => getCategoryColor(d.category))
        .attr("stroke-width", 2);

    // Update positions for all events (new and existing)
    const allEventGroups = eventGroups.merge(eventGroupsEnter);
    allEventGroups.select(".event-box-group")
        .attr("transform", d => {
            const xPos = xScale(new Date(d.year, getMonthIndex(d.month), d.day));
            const yPos = y(d.category) + y.bandwidth() / 2;
            return `translate(${xPos}, ${yPos})`;
        });

    // Update favorite classes
    allEventGroups.each(function(d) {
        if (!d) return;
        const eventId = `${d.category}-${d.date}-${d.time}`;
        const group = d3.select(this);
        
        // Remove all favorite classes
        group.classed('favorited-yellow', false)
            .classed('favorited-orange', false)
            .classed('favorited-red', false);
        
        // Add appropriate favorite classes
        Object.entries(favoriteEvents).forEach(([color, set]) => {
            if (set && set instanceof Set && set.has(eventId)) {
                group.classed(`favorited-${color}`, true);
            }
        });
    });
}

// Add this helper function at the top of your script.js file
function createSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Update the updateEventDetails function
function updateEventDetails(d) {
    const eventContent = document.getElementById("event-content");
    const formattedSummary = d.detailed_summary.replace(/\n/g, '</p><p>');
    
    // Check if there's deep dive content
    const hasDeepDive = d.deep_dive_content && Object.keys(d.deep_dive_content).length > 0 && 
        Object.values(d.deep_dive_content).some(arr => arr.length > 0);

    // Add class to event-content based on deep dive availability
    eventContent.className = hasDeepDive ? 'has-deep-dive' : 'no-deep-dive';

    // Create event URL
    const eventSlug = createSlug(d.title);
    const eventUrl = `https://theufotimeline.com/events/${eventSlug}/`;

    eventContent.innerHTML = `
        <div class="event-details-left">
            <div class="selected-event-header">
                <div class="title-container">
                    <div id="details-event-title">${d.title.toUpperCase()}</div>
                    <a href="${eventUrl}" target="_blank" class="magnify-link" title="View full case details">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="none" stroke="#00fffb" stroke-width="2" 
                                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </a>
                </div>
                <div id="details-event-date">${d.date}</div>
                <div id="details-event-location">${d.city}, ${d.state}, ${d.country}</div>
            </div>
            <div class="event-details-grid">
                <div class="detail-item"><span class="detail-title">Time:</span> ${d.time || 'Unknown'}</div>
                <div class="detail-item"><span class="detail-title">Craft Behavior:</span> ${d.craft_behavior}</div>
                <div class="detail-item"><span class="detail-title">CE Scale:</span> ${d.close_encounter_scale}</div>
                <div class="detail-item"><span class="detail-title">Witnesses:</span> ${d.witnesses || 'Unknown'}</div>
            </div>
            <p><span class="detail-title">Summary:</span> ${formattedSummary}</p>
            <div class="rating-system">
                <button class="rating-button like" data-event-id="${d.id}">▲ <span class="like-count">${d.likes}</span></button>
                <button class="rating-button dislike" data-event-id="${d.id}">▼ <span class="dislike-count">${d.dislikes}</span></button>
            </div>
        </div>
        ${hasDeepDive ? `
            <div class="event-details-right">
                ${generateDeepDiveContent(d)}
            </div>
        ` : ''}
    `;

    // Add event listeners for rating buttons
    const likeButton = eventContent.querySelector('.rating-button.like');
    const dislikeButton = eventContent.querySelector('.rating-button.dislike');

    if (likeButton && dislikeButton) {
        likeButton.addEventListener('click', () => rateEvent(d.id, 'like'));
        dislikeButton.addEventListener('click', () => rateEvent(d.id, 'dislike'));
    }

    document.getElementById("event-details").style.display = "block";

    if (!globeSvg) {
        initGlobe();
    }
    updateGlobe(parseFloat(d.latitude), parseFloat(d.longitude));

    highlightRelevantToggles(d);

    // Restore opacity to containers
    document.getElementById("event-details").style.opacity = "1";
    document.getElementById("globe-container").style.opacity = "1";
    document.getElementById("toggles").style.opacity = "1";
}

function updateEventField(fieldId, content) {
    const field = document.getElementById(fieldId);
    field.textContent = content;
    field.classList.remove('searching');
}

function initializeEventSearch() {
    const fields = document.querySelectorAll('.event-field');

    fields.forEach(field => {
        field.addEventListener('focus', activateSearchMode);
        field.addEventListener('blur', deactivateSearchMode);
        field.addEventListener('input', handleSearch);
    });
}

function activateSearchMode(event) {
    isSearchMode = true;
    event.target.textContent = '';
    event.target.classList.add('searching');
}

function deactivateSearchMode(event) {
    if (event.target.textContent.trim() === '') {
        event.target.classList.remove('searching');
        if (selectedEvent) {
            // Restore the original content if there's a selected event
            selectEvent(selectedEvent);
        }
    }
}

function handleSearch(event) {
    const searchTerm = event.target.textContent.toLowerCase();
    const searchType = event.target.id.split('-')[2]; // 'title', 'date', or 'location'

    switch (searchType) {
        case 'title':
            searchEventTitles(searchTerm);
            break;
        case 'date':
            handleDateSearch(searchTerm);
            break;
        case 'location':
            handleLocationSearch(searchTerm);
            break;
    }
}
function searchEventTitles(searchTerm) {
    const filteredEvents = ufo_events.filter(event => 
        event.title.toLowerCase().includes(searchTerm)
    );
    updateEvents(x, filteredEvents);
    updateAllEventPoints(filteredEvents);
}

function handleDateSearch(searchTerm) {
    if (searchTerm.endsWith('s')) {
        // Decade search
        const decade = parseInt(searchTerm.slice(0, -1));
        if (!isNaN(decade)) {
            zoomToDecade(decade);
        }
    } else {
        // Year or specific date search
        const year = parseInt(searchTerm);
        if (!isNaN(year)) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year + 1, 0, 1);
            zoomToTimeRange(startDate, endDate);
        } else {
            // Implement specific date search if needed
        }
    }
}

function handleLocationSearch(searchTerm) {
    searchTerm = searchTerm.toLowerCase().trim();
    
    // Try to center the globe on the location
    const location = findLocation(searchTerm);
    if (location) {
        centerGlobeOnLocation(location.latitude, location.longitude);
    }

    // Filter events based on location
    const filteredEvents = ufo_events.filter(event => 
        event.country.toLowerCase().includes(searchTerm) ||
        event.state.toLowerCase().includes(searchTerm) ||
        event.city.toLowerCase().includes(searchTerm)
    );
    updateEvents(x, filteredEvents);
    updateAllEventPoints(filteredEvents);
}

function findLocation(searchTerm) {
    // First, check if it's a country
    const country = ufo_events.find(event => event.country.toLowerCase() === searchTerm);
    if (country) return { latitude: country.latitude, longitude: country.longitude };

    // Then check if it's a state
    const state = ufo_events.find(event => event.state.toLowerCase() === searchTerm);
    if (state) return { latitude: state.latitude, longitude: state.longitude };

    // Finally, check if it's a city
    const city = ufo_events.find(event => event.city.toLowerCase() === searchTerm);
    if (city) return { latitude: city.latitude, longitude: city.longitude };

    // If no exact match, return the first partial match
    const partialMatch = ufo_events.find(event => 
        event.country.toLowerCase().includes(searchTerm) ||
        event.state.toLowerCase().includes(searchTerm) ||
        event.city.toLowerCase().includes(searchTerm)
    );
    if (partialMatch) return { latitude: partialMatch.latitude, longitude: partialMatch.longitude };

    // If no match found, return null
    return null;
}

function centerGlobeOnLocation(latitude, longitude) {
    if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid latitude or longitude');
        return;
    }

    // Update the globe's rotation to center on the given coordinates
    const rotation = [-longitude, -latitude, 0];
    
    d3.transition()
        .duration(1000)
        .tween("rotate", () => {
            const r = d3.interpolate(projection.rotate(), rotation);
            return (t) => {
                projection.rotate(r(t));
                globeSvg.selectAll("path").attr("d", path);
                updateAllEventPoints();
            };
        });
}

function zoomToTimeRange(startDate, endDate) {
    const [x0, x1] = x.domain();
    const [X0, X1] = x.range();

    const k = (X1 - X0) / (x(endDate) - x(startDate));
    const tx = -x(startDate);

    d3.select("#timeline svg").transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.scale(k).translate(tx, 0)
    );
}

// Call this function to initialize the resizable modal
document.addEventListener('DOMContentLoaded', function() {
    const openEventListModalButton = document.getElementById('openEventListModal');
    let modalOpen = false;

    if (openEventListModalButton) {
        openEventListModalButton.addEventListener('click', function() {
            const modal = document.getElementById('eventListModal');
            if (modalOpen) {
                modal.style.display = 'none';
                modalOpen = false;
            } else {
                initEventListModal();
                modalOpen = true;
            }
        });
    }
});

// Call this function to initialize the event search functionality
document.addEventListener('DOMContentLoaded', initializeEventSearch);

let tooltipTimeout;

function showTooltip(event, d) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
        const country = abbreviateCountry(d.country);
        const tooltipContent = `
            <strong>${d.title}</strong><br>
            ${d.date}<br>
            ${d.city}, ${d.state}, ${country}
        `;

        let tooltipX, tooltipY;

        const eventGroup = event.target.closest('.event-group');
        if (eventGroup) {
            const eventRect = eventGroup.getBoundingClientRect();
            tooltipX = eventRect.right + window.pageXOffset + 10;
            tooltipY = eventRect.top + window.pageYOffset;
        } else {
            // Fallback to mouse position if .event-group is not found
            tooltipX = event.pageX + 10;
            tooltipY = event.pageY + 10;
        }

        d3.select("#tooltip")
            .style("left", tooltipX + "px")
            .style("top", tooltipY + "px")
            .style("opacity", 0)
            .style("display", "block")
            .html(tooltipContent)
            .transition()
            .duration(200)
            .style("opacity", 1);
    }, 500);
}

function hideTooltip() {
    clearTimeout(tooltipTimeout);
    d3.select("#tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() {
            d3.select(this).style("display", "none");
        });
}

function abbreviateCountry(country) {
    const abbreviations = {
        "United States": "US",
        "United Kingdom": "UK",
        "Australia": "AU",
        "England": "ENG",
    };
    return abbreviations[country] || country;
}

function rateEvent(eventId, ratingType) {
    if (localStorage.getItem(`rated_${eventId}`)) {
        alert('You have already rated this event.');
        return;
    }

    if (typeof wpApiSettings === 'undefined') {
        alert('Unable to submit rating at this time. Please try again later.');
        return;
    }

    fetch(wpApiSettings.root + 'custom/v1/rate-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
            event_id: eventId,
            rating_type: ratingType
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        const button = document.querySelector(`.rating-button.${ratingType}[data-event-id="${eventId}"]`);
        const countSpan = button.querySelector(`.${ratingType}-count`);
        countSpan.textContent = data.newCount;

        localStorage.setItem(`rated_${eventId}`, ratingType);

        document.querySelectorAll(`.rating-button[data-event-id="${eventId}"]`).forEach(btn => {
            btn.disabled = true;
            btn.classList.add('voted');
        });
    })
    .catch(error => {
        alert(error.message || 'An error occurred while rating the event. Please try again later.');
    });
}

function updateRatingUI(eventId, ratingType) {
    const button = document.querySelector(`.rating-button.${ratingType}[data-event-id="${eventId}"]`);
    const countSpan = button.querySelector(`.${ratingType}-count`);
    countSpan.textContent = parseInt(countSpan.textContent) + 1;

    // Disable both buttons after rating
    document.querySelectorAll(`.rating-button[data-event-id="${eventId}"]`).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('voted');
    });
}

function handleClickOffEvent(e) {
    const eventDetails = document.getElementById("event-details");
    if (!eventDetails.contains(e.target)) {
        // Clicked outside the event details
        document.removeEventListener('click', handleClickOffEvent);
    }
}

function toggleColorScheme() {
    document.body.classList.toggle('high-contrast');
    
    // Update only the visual elements without changing the timeline position
    const currentTransform = d3.zoomTransform(d3.select("#timeline svg").node());
    const currentXScale = currentTransform.rescaleX(x);
    
    // Update category buttons
    svg.selectAll(".category-button")
        .select("rect")
        .attr("stroke", d => getCategoryColor(d));

    // Update event styles
    svg.selectAll(".event-line")
        .attr("stroke", d => getCategoryColor(d.category));

    svg.selectAll(".event-rect")
        .attr("stroke", d => getCategoryColor(d.category));

    svg.selectAll(".event-circle")
        .attr("stroke", d => getCategoryColor(d.category));

    // Update all-event-point colors on the globe
    d3.selectAll(".all-event-point")
        .attr("fill", d => getCategoryColor(d.category));

    // Update donut chart
    updateDonutChart();

    // Update events
    updateEvents(currentXScale);

    // Update globe points
    updateAllEventPoints();
    
    if (selectedEvent) {
        showEventDetails(null, selectedEvent);
    }

    // Apply high-contrast styles to deep dive content
    const deepDiveItems = document.querySelectorAll('.deep-dive-item');
    deepDiveItems.forEach(item => {
        item.classList.toggle('high-contrast');
    });
}

function initTodayInUFOHistory() {
    const container = document.getElementById('this-day-container');
    if (!container) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Find the event closest to today's date
    const closestEvent = ufo_events.reduce((closest, event) => {
        const [eventMonth, eventDay] = event.date.split(' ');
        const eventMonthNum = getMonthIndex(eventMonth) + 1;
        const eventDayNum = parseInt(eventDay);

        const currentDiff = Math.abs(currentMonth * 100 + currentDay - (eventMonthNum * 100 + eventDayNum));
        const closestDiff = Math.abs(currentMonth * 100 + currentDay - (getMonthIndex(closest.date.split(' ')[0]) + 1) * 100 - parseInt(closest.date.split(' ')[1]));

        return currentDiff < closestDiff ? event : closest;
    });

    // Populate the container with the event details
    const eventNameElement = document.getElementById('this-day-event-name');
    if (eventNameElement) {
        const titleContainer = document.createElement('div');
        titleContainer.style.display = 'flex';
        titleContainer.style.alignItems = 'center';
        titleContainer.style.justifyContent = 'center';
        titleContainer.style.gap = '10px';

        const categoryDot = document.createElement('span');
        categoryDot.style.width = '10px';
        categoryDot.style.height = '10px';
        categoryDot.style.borderRadius = '50%';
        categoryDot.style.backgroundColor = getCategoryColor(closestEvent.category);

        titleContainer.appendChild(categoryDot);
        titleContainer.appendChild(document.createTextNode(closestEvent.title));

        eventNameElement.innerHTML = '';
        eventNameElement.appendChild(titleContainer);
    }

    // Add click event to navigate to the event on the timeline
    container.addEventListener('click', () => {
        // Select and show the event details
        selectEvent(closestEvent);
        showEventDetails(null, closestEvent);
        
        // Calculate the date for the event
        const eventDate = new Date(closestEvent.year, getMonthIndex(closestEvent.month), closestEvent.day);
        
        // Calculate the zoom transform to center on this date
        const [x0, x1] = x.domain();
        const [X0, X1] = x.range();
        
        // Calculate scale to show roughly a 2-year window
        const yearInMs = 365 * 24 * 60 * 60 * 1000;
        const startDate = new Date(eventDate.getTime() - yearInMs);
        const endDate = new Date(eventDate.getTime() + yearInMs);
        
        const k = (X1 - X0) / (x(endDate) - x(startDate));
        const tx = -x(startDate);

        // Apply the transform with a smooth transition
        d3.select("#timeline svg")
            .transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.scale(k).translate(tx, 0));
    });
}

function showDeepDiveContent(event) {
    const modalContent = document.getElementById('modalContent');
    const modal = document.getElementById('deepDiveModal');
    
    modalContent.innerHTML = ''; // Clear previous content
    
    if (event && event.deep_dive_content && Object.keys(event.deep_dive_content).length > 0) {
        // Create tab structure
        let tabHTML = '<div class="tabs">';
        let contentHTML = '<div class="tab-content">';
        
        const contentTypes = ['Images', 'Videos', 'Reports', 'News Coverage'];
        
        contentTypes.forEach((type, index) => {
            const typeContent = event.deep_dive_content[type];
            if (typeContent && typeContent.length > 0) {
                tabHTML += `<button class="tab-button${index === 0 ? ' active' : ''}" data-tab="${type}">${type}</button>`;
                contentHTML += `<div class="tab-pane${index === 0 ? ' active' : ''}" id="${type}-content">`;
                contentHTML += createGalleryLayout(typeContent, type);
                contentHTML += '</div>';
            }
        });
        
        tabHTML += '</div>';
        contentHTML += '</div>';
        
        modalContent.innerHTML = tabHTML + contentHTML;
        
        // Initialize tabs
        initializeTabs();
        
        // Initialize the first active gallery
        initializeGallery(contentTypes[0]);
    } else {
        modalContent.innerHTML = '<p>No deep dive content available for this event.</p>';
    }

    // Show the modal
    modal.style.display = "block";

    // Make modal draggable and resizable like event list modal
    makeDraggable(modal);
    initResizableModal(modal);

    // Close the modal when clicking on <span> (x)
    const span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Close the modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function createGalleryLayout(items, type) {
    let galleryHTML = '<div class="gallery-container">';
    galleryHTML += '<div class="thumbnails">';
    
    items.forEach((item, index) => {
        let thumbSrc, fullSrc, caption;
        
        switch(type) {
            case 'Images':
                // Handle multiple images
                if (Array.isArray(item.content)) {
                    item.content.forEach((imgSrc, imgIndex) => {
                        thumbSrc = fullSrc = imgSrc;
                        galleryHTML += `<img src="${thumbSrc}" alt="Thumbnail ${index + 1}-${imgIndex + 1}" class="thumbnail" data-full="${fullSrc}" data-type="${type}">`;
                    });
                } else {
                    thumbSrc = fullSrc = item.content;
                    galleryHTML += `<img src="${thumbSrc}" alt="Thumbnail ${index + 1}" class="thumbnail" data-full="${fullSrc}" data-type="${type}">`;
                }
                break;
            case 'Videos':
                thumbSrc = item.content.thumbnail;
                fullSrc = item.content.url;
                caption = item.content.title;
                galleryHTML += `<img src="${thumbSrc}" alt="Thumbnail ${index + 1}" class="thumbnail" data-full="${fullSrc}" data-type="${type}" data-caption="${caption || ''}">`;
                break;
            case 'Reports':
            case 'News Coverage':
                thumbSrc = item.content.thumbnail;
                fullSrc = item.content.url;
                caption = item.content.title;
                galleryHTML += `<img src="${thumbSrc}" alt="Thumbnail ${index + 1}" class="thumbnail" data-full="${fullSrc}" data-type="${type}" data-caption="${caption || ''}">`;
                break;
        }
    });
    
    galleryHTML += '</div>';
    galleryHTML += '<div class="main-viewer">';
    galleryHTML += `<div class="viewer-content"></div>`;
    galleryHTML += '<p class="caption"></p>';
    galleryHTML += '</div>';
    galleryHTML += '</div>';
    
    return galleryHTML;
}

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tabContent = document.querySelectorAll('.tab-pane');
            tabContent.forEach(content => content.classList.remove('active'));
            document.getElementById(`${button.dataset.tab}-content`).classList.add('active');
            initializeGallery(button.dataset.tab);
        });
    });
}

function initializeGallery(type) {
    const thumbnails = document.querySelectorAll(`#${type}-content .thumbnail`);
    const viewer = document.querySelector(`#${type}-content .viewer-content`);
    const caption = document.querySelector(`#${type}-content .caption`);
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            
            const fullSrc = thumb.dataset.full;
            const itemType = thumb.dataset.type;
            
            switch(itemType) {
                case 'Images':
                    viewer.innerHTML = `<img src="${fullSrc}" alt="Full size image">`;
                    break;
                case 'Videos':
                    viewer.innerHTML = `<video controls><source src="${fullSrc}" type="video/mp4">Your browser does not support the video tag.</video>`;
                    break;
                case 'Reports':
                case 'News Coverage':
                    viewer.innerHTML = `<iframe src="${fullSrc}" width="100%" height="500px"></iframe>`;
                    break;
            }
            
            caption.textContent = thumb.dataset.caption;
        });
    });
    
    // Activate the first thumbnail by default
    if (thumbnails.length > 0) {
        thumbnails[0].click();
    }
}

document.getElementById('switch-container-btn').addEventListener('click', function() {
    if (selectedEvent) {
        showDeepDiveContent(selectedEvent);
    } else {
        console.log("No event selected");
    }
});

function updateGlobeDimensions() {
    if (!globeSvg) return;

    const globeContainer = document.getElementById('globe-container');
    const infoContainer = document.getElementById('info-container');
    const size = Math.min(globeContainer.offsetWidth, globeContainer.offsetHeight, infoContainer.offsetHeight - 40);

    globeSvg
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${size} ${size}`);
    
    projection
        .scale(size / 2 - 2)
        .translate([size / 2, size / 2]);
    
    globeSvg.selectAll('path').attr('d', path);

    // Reset zoom
    const center = [size / 2, size / 2];
    globeSvg.transition().duration(750).call(
        globeZoom.transform,
        d3.zoomIdentity,
        center
    );
}

function getMonthIndex(monthName) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months.indexOf(monthName);
}

function resize() {
    const newWidth = window.innerWidth - margin.left - margin.right;
    const newHeight = 420 - margin.top - margin.bottom; // Increased by 20px

    d3.select("#timeline svg")
        .attr("width", newWidth + margin.left + margin.right)
        .attr("height", newHeight + margin.top + margin.bottom);

    x.range([0, newWidth]);
    y.range([0, newHeight]);

    gX.attr("transform", `translate(0,${newHeight})`)
      .call(xAxis);

    svg.selectAll(".category-button")
       .attr("transform", d => `translate(${-margin.left}, ${y(d)})`);

    svg.selectAll(".category-button rect")
       .attr("height", y.bandwidth());

    svg.selectAll(".category-button text")
       .attr("y", y.bandwidth() / 2);

    svg.selectAll(".category-row-timeline")
       .attr("y", d => y(d))
       .attr("width", newWidth)
       .attr("height", y.bandwidth());

    svg.select("line")
       .attr("y2", newHeight);

    svg.select("#clip rect")
       .attr("width", newWidth)
       .attr("height", newHeight);

    updateEvents(x);
    if (globeSvg) {
        updateGlobeDimensions();
    }
    createDonutChart(); // Recreate the chart on resize
    updateDonutChart();
}

function updateGlobe(lat, lon) {
    if (!globeSvg) {
        console.warn("Globe not initialized yet. Initializing now.");
        initGlobe();
    }

    stopGlobeRotation(); // Stop rotation when an event is selected

    const g = globeSvg.select("g");
    
    // Remove existing event point and pulse
    g.selectAll(".event-point, .event-point-pulse").remove();
    
    // If lat and lon are provided, update the globe
    if (lat !== null && lon !== null && !isNaN(lat) && !isNaN(lon)) {
        rotation = [-lon, -lat, 0];
        
        d3.transition()
            .duration(1000)
            .tween("rotate", () => {
                const r = d3.interpolate(projection.rotate(), rotation);
                return (t) => {
                    projection.rotate(r(t));
                    g.selectAll("path").attr("d", path);
                    updateAllEventPoints();
                };
            })
            .on("end", () => {
                // Create new event point with fade-in and pulse animation
                g.append("circle")
                    .attr("class", "event-point")
                    .attr("cx", projection([lon, lat])[0])
                    .attr("cy", projection([lon, lat])[1])
                    .attr("r", 4)
                    .attr("fill", "none")
                    .attr("stroke", "#FFA500")
                    .attr("stroke-width", 2)
                    .attr("opacity", 0)
                    .transition()
                    .duration(300)
                    .attr("opacity", 1);
                
                // Add a pulsating effect
                g.append("circle")
                    .attr("class", "event-point-pulse")
                    .attr("cx", projection([lon, lat])[0])
                    .attr("cy", projection([lon, lat])[1])
                    .attr("r", 4)
                    .attr("fill", "none")
                    .attr("stroke", "#FFA500")
                    .attr("stroke-width", 1)
                    .attr("opacity", 0)
                    .transition()
                    .duration(300)
                    .attr("opacity", 1)
                    .transition()
                    .duration(2000)
                    .attr("r", 12)
                    .attr("opacity", 0)
                    .ease(d3.easeQuadOut)
                    .on("end", function() {
                        d3.select(this).remove();
                    });
            });
    } else {
        // If no lat and lon provided, just update all event points
        updateAllEventPoints();
    }
}

function updateAllEventPoints(customDataset = null) {
    const dataset = customDataset || ufo_events;
    const g = globeSvg.select("g");
    g.selectAll(".all-event-point").remove();

    // Apply filters to dataset
    let filteredEvents = dataset.filter(d => 
        activeCategories.has(d.category) &&
        (activeCraftTypes.size === 0 || d.craft_type.split(', ').some(type => activeCraftTypes.has(type))) &&
        (activeEntityTypes.size === 0 || d.entity_type.split(', ').some(type => activeEntityTypes.has(type)))
    );

    // Apply favorites filter if active
    if (Object.values(showingOnlyFavorites).some(isActive => isActive)) {
        filteredEvents = filteredEvents.filter(d => {
            const eventId = `${d.category}-${d.date}-${d.time}`;
            return Object.entries(showingOnlyFavorites).some(([color, isActive]) => 
                isActive && favoriteEvents[color] && favoriteEvents[color].has && favoriteEvents[color].has(eventId)
            );
        });
    }

    g.selectAll(".all-event-point")
        .data(filteredEvents)
        .enter()
        .append("circle")
        .attr("class", "all-event-point")
        .attr("cx", d => {
            const coords = projection([+d.longitude, +d.latitude]);
            return coords ? coords[0] : null;
        })
        .attr("cy", d => {
            const coords = projection([+d.longitude, +d.latitude]);
            return coords ? coords[1] : null;
        })
        .attr("r", 2)
        .attr("fill", d => {
            const eventId = `${d.category}-${d.date}-${d.time}`;
            // Check each color for favorites
            for (const [color, set] of Object.entries(favoriteEvents)) {
                if (set.has(eventId)) {
                    return getColorValue(color);
                }
            }
            return getCategoryColor(d.category); // Changed from conditional fill to category color
        })
        .attr("stroke", d => {
            const eventId = `${d.category}-${d.date}-${d.time}`;
            // Check each color for favorites
            for (const [color, set] of Object.entries(favoriteEvents)) {
                if (set.has(eventId)) {
                    return getColorValue(color);
                }
            }
            return "none";
        })
        .attr("opacity", d => {
            const coords = projection([+d.longitude, +d.latitude]);
            if (!coords) return 0;
            
            const [x, y] = projection.rotate();
            const pointLong = +d.longitude;
            const pointLat = +d.latitude;
            const rotatedLong = ((pointLong + 180 + x) % 360) - 180;
            const cosDistance = Math.sin(pointLat * Math.PI / 180) * Math.sin(-y * Math.PI / 180) +
                              Math.cos(pointLat * Math.PI / 180) * Math.cos(-y * Math.PI / 180) * 
                              Math.cos((rotatedLong) * Math.PI / 180);
            
            return cosDistance > 0 ? 0.8 : 0;
        })
        .style("filter", d => {
            const eventId = `${d.category}-${d.date}-${d.time}`;
            // Check each color for favorites
            for (const [color, set] of Object.entries(favoriteEvents)) {
                if (set.has(eventId)) {
                    return `drop-shadow(0 0 3px ${getColorValue(color)})`;
                }
            }
            return "none";
        })
        .on("mouseover", function(event, d) {
            setEventPointHoverState(this, true);
            showTooltip(event, d);
        })
        .on("mouseout", function(event, d) {
            setEventPointHoverState(this, false);
            hideTooltip();
        })
        .on("click", function(event, d) {
            event.stopPropagation();
            selectEvent(d);
            showEventDetails(event, d);
        });

    adjustEventPointSize();

    // Remove xScale parameter when calling drawGlobeFavoriteConnections
    drawGlobeFavoriteConnections();
}

function fadeOutEventPoint() {
    globeSvg.select(".event-point")
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .on("end", function() {
            d3.select(this).remove();
        });

    globeSvg.select(".event-point-pulse")
        .transition()
        .duration(300)
        .attr("opacity", 0)
        .on("end", function() {
            d3.select(this).remove();
        });
}

function adjustEventPointSize() {
    const transform = d3.zoomTransform(globeSvg.node());
    const baseSize = 2;
    const hoverSize = 3;
    const scale = transform.k || currentTouchScale;
    const scaledBaseSize = Math.max(0.5, baseSize / scale);
    const scaledHoverSize = Math.max(1, hoverSize / scale);

    globeSvg.selectAll(".all-event-point")
        .attr("r", function() {
            return d3.select(this).classed("hovered") ? scaledHoverSize : scaledBaseSize;
        });
}

function setEventPointHoverState(element, isHovered) {
    d3.select(element)
        .classed("hovered", isHovered)
        .transition()
        .duration(150) // Faster transition
        .attr("r", isHovered ? 3 : 2) // Smaller size increase
        .attr("opacity", isHovered ? 1 : 0.8);
}

function createDonutChart() {
    const container = document.getElementById('donut-chart-container');
    const size = Math.max(container.offsetHeight, 1);
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 * 0.8;

    d3.select("#donut-chart-container svg").remove();

    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(categories.map(category => getCategoryColor(category)));

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

    const svg = d3.select("#donut-chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const categoryData = categories.map(category => ({
        category: category,
        value: ufo_events.filter(event => event.category === category).length
    }));

    const arcs = svg.selectAll(".arc")
        .data(pie(categoryData))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .each(function(d) { this._current = d; }); // store the initial angles

    // Add invisible wider arc for better hover area
    arcs.append("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.5)
            .outerRadius(radius * 1.1)
        )
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .on("mouseover", function(event, d) {
            showDonutTooltip(event, d);
            d3.select(this.parentNode).select("path:first-child")
                .transition()
                .duration(200)
                .attr("transform", "scale(1.05)");
        })
        .on("mouseout", function(event, d) {
            hideDonutTooltip();
            d3.select(this.parentNode).select("path:first-child")
                .transition()
                .duration(200)
                .attr("transform", "scale(1)");
        });

    // Add total count in the center
    const totalCount = categoryData.reduce((sum, d) => sum + d.value, 0);
    svg.append("text")
        .attr("class", "total-count")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("font-size", "24px")
        .style("fill", "white")
        .text(totalCount);

    // Add "Total Cases" label
    svg.append("text")
        .attr("class", "total-label")
        .attr("text-anchor", "middle")
        .attr("dy", "2.5em")
        .style("font-size", "10px")
        .style("fill", "white")
        .text("Total Cases");
}

function updateDonutChart(customDataset = null) {
    const container = document.getElementById('donut-chart-container');
    const size = container.offsetHeight;
    const width = size;
    const height = size;
    const radius = Math.min(width, height) / 2 * 0.8;

    const color = d3.scaleOrdinal()
        .domain(categories)
        .range(categories.map(category => getCategoryColor(category)));

    const pie = d3.pie()
        .sort(null)
        .value(d => d.value);

    const arc = d3.arc()
        .innerRadius(radius * 0.6)
        .outerRadius(radius);

    const dataset = customDataset || ufo_events;
    const categoryData = categories
        .filter(category => activeCategories.has(category))
        .map(category => ({
            category: category,
            value: dataset.filter(event => 
                event.category === category &&
                (activeCraftTypes.size === 0 || event.craft_type.split(', ').some(type => activeCraftTypes.has(type))) &&
                (activeEntityTypes.size === 0 || event.entity_type.split(', ').some(type => activeEntityTypes.has(type)))
            ).length
        }));

    const svg = d3.select("#donut-chart-container svg g");

    const arcs = svg.selectAll(".arc")
        .data(pie(categoryData), d => d.data.category);

    // Remove arcs for categories that are no longer present
    arcs.exit().remove();

    // Update existing arcs
    arcs.select("path")
        .transition()
        .duration(750)
        .attrTween("d", function(d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        })
        .attr("fill", d => color(d.data.category));

    // Add new arcs
    const enter = arcs.enter().append("g")
        .attr("class", "arc");

    enter.append("path")
        .attr("d", arc)
        .attr("fill", d => color(d.data.category))
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .each(function(d) { this._current = d; })
        .on("mouseover", arcTween(arc, 0.1))
        .on("mouseout", arcTween(arc, 0));

    // Update total count
    const totalCount = categoryData.reduce((sum, d) => sum + d.value, 0);
    svg.select(".total-count")
        .transition()
        .duration(750)
        .tween("text", function() {
            const i = d3.interpolate(parseFloat(this.textContent), totalCount);
            return function(t) {
                this.textContent = Math.round(i(t));
            };
        });

    function arcTween(arc, outerRadiusOffset) {
        return function() {
            const d = d3.select(this).datum();
            const interpolate = d3.interpolate(d.outerRadius, radius + outerRadiusOffset * radius);
            return function(t) {
                d.outerRadius = interpolate(t);
                return arc(d);
            };
        };
    }
}

function showDonutTooltip(event, d) {
    const tooltipX = event.pageX;
    const tooltipY = event.pageY;

    d3.select("#tooltip")
        .style("left", (tooltipX + 10) + "px")
        .style("top", (tooltipY + 10) + "px")
        .style("opacity", 0)
        .style("display", "block")
        .html(`
            <strong>${d.data.category}</strong><br>
            Count: ${d.data.value}
        `)
        .transition()
        .duration(200)
        .style("opacity", 1);
}

function hideDonutTooltip() {
    d3.select("#tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", function() {
            d3.select(this).style("display", "none");
        });
}

function initSearch() {
    // Get both search inputs
    const searchInputs = document.querySelectorAll('#search-input');
    
    searchInputs.forEach(searchInput => {
        if (searchInput) {
            // Add input event listener to both search inputs
            searchInput.addEventListener('input', debounce(function(e) {
                // Only sync with existing inputs
                const otherInputs = document.querySelectorAll('#search-input');
                otherInputs.forEach(input => {
                    if (input && input !== e.target) {
                        input.value = e.target.value;
                    }
                });
                performSearch();
            }, 300));

            // Add search event listener to both inputs
            searchInput.addEventListener('search', function(e) {
                if (e.target.value === '') {
                    currentSearchTerm = '';
                    // Only sync with existing inputs
                    const otherInputs = document.querySelectorAll('#search-input');
                    otherInputs.forEach(input => {
                        if (input && input !== e.target) {
                            input.value = '';
                        }
                    });
                    performSearch();
                }
            });
        }
    });
}

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Get both event list buttons
    const eventListButtons = document.querySelectorAll('#openEventListModal');
    
    eventListButtons.forEach(button => {
        button.addEventListener('click', initEventListModal);
    });
});

// Color scheme toggle functionality
const colorSchemeToggle = document.getElementById('color-scheme-toggle');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const colorSchemeToggle = document.getElementById('color-scheme-toggle');
    colorSchemeToggle.addEventListener('change', toggleColorScheme);

    initGlobe();
    createCraftTypeButtons();
    createEntityTypeButtons();
    updateEvents(x);
    updateGlobeDimensions();
    createDonutChart();
    initSearch();
    initTodayInUFOHistory();
    resize();
    setInitialZoom(); // Add this line to set the initial zoom

    // Initialize color scheme
    document.body.classList.add('default-scheme');

    // Add this to your existing DOMContentLoaded event listener
    initMobileToggles();
});

d3.select("#timeline svg").on("wheel", function(event) {
    event.preventDefault();
    const delta = event.deltaY;
    if (delta > 0) {
        zoom.scaleBy(d3.select(this).transition().duration(200), 0.9);
    } else {
        zoom.scaleBy(d3.select(this).transition().duration(200), 1.1);
    }
});

document.getElementById('globe-container').addEventListener('wheel', handleGlobeWheel, { passive: false });

function handleGlobeWheel(event) {
    event.preventDefault();
    const delta = event.deltaY;
    const center = [
        parseFloat(globeSvg.attr("width")) / 2 || 0, 
        parseFloat(globeSvg.attr("height")) /2 || 0
    ];
    
    let scale = delta > 0 ? 0.9 : 1.1;
    
    // Ensure we're not zooming beyond limits
    const currentTransform = d3.zoomTransform(globeSvg.node());
    const newScale = currentTransform.k * scale;
    if (newScale < 1 || newScale > 8) return; // Adjust these limits as needed

    globeZoom.scaleBy(globeSvg.transition().duration(200), scale, center);
    hideTooltip(); // Add this line
}

// Add event listener for window resize
window.addEventListener('resize', resize);

document.addEventListener('click', (event) => {
    if (!event.target.closest('.event-group')) {
        hideTooltip();
    }
});

// Initialize the visualization
updateEvents(x);

// Add these functions to your script.js file

function createGlobeCategoryToggles() {
    const container = document.getElementById('globe-category-toggles');
    categories.forEach(category => {
        const toggle = document.createElement('div');
        toggle.className = 'globe-category-toggle';
        toggle.setAttribute('data-category', category);
        toggle.title = category;

        const dot = document.createElement('div');
        dot.className = 'globe-category-toggle-dot';
        dot.style.backgroundColor = getCategoryColor(category);

        const name = document.createElement('span');
        name.className = 'globe-category-name';
        name.textContent = category.toUpperCase();

        toggle.appendChild(dot);
        toggle.appendChild(name);

        toggle.addEventListener('click', () => toggleCategory(null, category));
        
        // Restore hover functionality
        toggle.addEventListener('mouseenter', () => {
            name.style.maxWidth = '150px';
            name.style.opacity = '1';
            name.style.marginLeft = '10px';
        });
        toggle.addEventListener('mouseleave', () => {
            if (!toggle.classList.contains('selected')) {
                name.style.maxWidth = '0';
                name.style.opacity = '0';
                name.style.marginLeft = '0';
            }
        });

        container.appendChild(toggle);
    });
}

function updateGlobeCategoryToggles() {
    const toggles = document.querySelectorAll('.globe-category-toggle');
    toggles.forEach(toggle => {
        const category = toggle.getAttribute('data-category');
        toggle.classList.toggle('inactive', !activeCategories.has(category));
    });
}

// Modify the existing toggleCategory function to include updating globe category toggles
function toggleCategory(event, category) {
    if (activeCategories.has(category)) {
        // If it's the last active category, activate all categories
        if (activeCategories.size === 1) {
            activeCategories = new Set(categories);
        } else {
            // Otherwise, just remove this category
            activeCategories.delete(category);
        }
    } else {
        // Add this category to active categories
        activeCategories.add(category);
    }

    // Update button states
    svg.selectAll(".category-button")
        .select(".category-indicator")
        .attr("opacity", d => activeCategories.has(d) ? 1 : 0);

    // Update button stroke opacity
    svg.selectAll(".category-button")
        .select("rect")
        .transition()
        .duration(200)
        .attr("stroke-opacity", d => activeCategories.has(d) ? 1 : 0.3);

    // Update globe category toggles
    updateGlobeCategoryToggles();

    // Update visualizations
    updateTimeline();
    updateDonutChart();
    updateAllEventPoints();
}

// Add this function at the end of your script.js file
function createLogoutConfirmationModal() {
    const modal = document.createElement('div');
    modal.id = 'logoutConfirmationModal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Logout Confirmation</h2>
            <p>Are you sure you want to logout?</p>
            <div class="modal-buttons">
                <button id="logoutConfirmYes" class="modal-button">Yes</button>
                <button id="logoutConfirmNo" class="modal-button">No</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const yesButton = document.getElementById('logoutConfirmYes');
    const noButton = document.getElementById('logoutConfirmNo');

    yesButton.addEventListener('click', function() {
        window.location.href = document.getElementById('logout-option').getAttribute('href');
    });

    noButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    return modal;
}

// Modify the existing event listeners section
document.addEventListener('DOMContentLoaded', function() {
    const submitCaseModal = document.getElementById('submit-case-modal');
    const closeBtn = submitCaseModal.querySelector('.close');
    const submitCaseOption = document.getElementById('submit-case-option');

    function openSubmitCaseModal() {
        submitCaseModal.style.display = 'block';
    }

    submitCaseOption.addEventListener('click', function(e) {
        e.preventDefault();
        openSubmitCaseModal();
        userProfileDropdown.style.display = 'none'; // Hide the dropdown after clicking
    });

    closeBtn.addEventListener('click', function() {
        submitCaseModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == submitCaseModal) {
            submitCaseModal.style.display = 'none';
        }
    });

    const userProfileButton = document.getElementById('user-profile-button');
    const userProfileDropdown = document.getElementById('user-profile-dropdown');
    const logoutOption = document.getElementById('logout-option');
    const logoutConfirmationModal = createLogoutConfirmationModal();

    userProfileButton.addEventListener('click', function(e) {
        e.stopPropagation();
        userProfileDropdown.style.display = userProfileDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', function(e) {
        if (!userProfileButton.contains(e.target)) {
            userProfileDropdown.style.display = 'none';
        }
    });

    // Add functionality for Settings and Tutorial options
    document.getElementById('settings-option').addEventListener('click', function(e) {
        e.preventDefault();
        // Add your settings functionality here
        console.log('Settings clicked');
    });

    document.getElementById('tutorial-option').addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://www.youtube.com/@TheUFOTimeline', '_blank');
    });

    // Modify the logout option to show the confirmation modal
    logoutOption.addEventListener('click', function(e) {
        e.preventDefault();
        logoutConfirmationModal.style.display = 'block';
    });
});

// Add this function to create the reset button
function addResetGlobeButton() {
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset Globe';
    resetButton.id = 'reset-globe-button';
    resetButton.className = 'control-button';
    resetButton.onclick = updateGlobeDimensions;
    
    const globeContainer = document.getElementById('globe-container');
    globeContainer.appendChild(resetButton);
}

// Add this near the top of the file with other document.addEventListener('DOMContentLoaded', ...) blocks
document.addEventListener('DOMContentLoaded', function() {
    const welcomeModal = document.getElementById('welcomeModal');
    const welcomeDonateButton = document.getElementById('welcomeDonateButton');
    const welcomeContinueButton = document.getElementById('welcomeContinueButton');

    // Comment out or remove this line that shows the welcome modal
    // welcomeModal.style.display = 'block';

    if (welcomeDonateButton) {
        welcomeDonateButton.onclick = function() {
            window.open('https://www.paypal.com/donate?token=3HWXAUE6wnGjeu0Zaz5GRPKgAHgQi9IK4pN2Tt48PpRA6dia8OvlgHxkx7k2eF2HPOtCNZVHnT7dKkO7', '_blank');
            welcomeModal.style.display = 'none';
        }
    }

    if (welcomeContinueButton) {
        welcomeContinueButton.onclick = function() {
            welcomeModal.style.display = 'none';
        }
    }
});



// Add this new function to generate deep dive content
function generateDeepDiveContent(event) {
    if (!event.deep_dive_content || Object.keys(event.deep_dive_content).length === 0) {
        return '<p>No deep dive content available for this event.</p>';
    }

    const contentTypes = ['Images', 'Videos', 'Reports', 'News Coverage'];
    let hasContent = false;

    // Create tabs
    let content = '<div class="tabs">';
    contentTypes.forEach((type, index) => {
        if (event.deep_dive_content[type] && event.deep_dive_content[type].length > 0) {
            hasContent = true;
            content += `<button class="tab-button${index === 0 ? ' active' : ''}" data-tab="${type}">${type}</button>`;
        }
    });
    content += '</div>';

    if (!hasContent) {
        return '<p>No deep dive content available for this event.</p>';
    }

    // Create tab content
    content += '<div class="tab-content">';
    contentTypes.forEach((type, index) => {
        if (event.deep_dive_content[type] && event.deep_dive_content[type].length > 0) {
            content += `<div class="tab-pane${index === 0 ? ' active' : ''}" id="${type}-content">`;
            
            switch(type) {
                case 'Images':
                    content += `<div class="deep-dive-grid">`;
                    event.deep_dive_content[type].forEach(item => {
                        // ACF gallery field returns array of images directly
                        if (item.images && Array.isArray(item.images)) {
                            item.images.forEach(image => {
                                content += `
                                    <div class="deep-dive-item">
                                        <img src="${image.url}" 
                                            class="deep-dive-thumbnail" 
                                            onclick="openLightbox('${image.url}')" 
                                            alt="${image.alt || 'Deep dive image'}">
                                    </div>`;
                            });
                        }
                    });
                    content += '</div>';
                    break;

                case 'Videos':
                    content += `
                        <div class="video-grid">
                            ${event.deep_dive_content[type].map((item) => {
                                if (item.content && item.content.video) {
                                    return item.content.video.map(videoItem => `
                                        <div class="video-thumbnail">
                                            ${videoItem.video_link}
                                        </div>`
                                    ).join('');
                                }
                                return '';
                            }).join('')}
                        </div>`;
                    break;

                case 'Reports':
                case 'News Coverage':
                    content += `<div class="deep-dive-grid">`;
                    event.deep_dive_content[type].forEach(item => {
                        if (item.type === 'report' && item.content) {
                            content += `
                                <div class="deep-dive-item" onclick="openDocument('${item.content.url}', '${item.content.title}')">
                                    <img src="${item.content.thumbnail}" alt="PDF thumbnail" class="deep-dive-thumbnail">
                                    <div class="item-title">${item.content.title}</div>
                                </div>`;
                        } else if (item.type === 'image' && Array.isArray(item.content)) {
                            item.content.forEach(imageUrl => {
                                content += `
                                    <div class="deep-dive-item" onclick="showFullImage('${imageUrl}')">
                                        <img src="${imageUrl}" alt="Report image" class="deep-dive-thumbnail">
                                    </div>`;
                            });
                        }
                    });
                    content += '</div>';
                    break;
            }
            content += '</div>';
        }
    });
    content += '</div>';

    setTimeout(() => {
        initializeDeepDiveTabs();
    }, 0);

    return content;
}



function openDocument(url, title) {
    const modal = document.getElementById('deepDiveModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="document-viewer">
            <h3>${title}</h3>
            <iframe src="${url}" width="100%" height="600px" frameborder="0"></iframe>
        </div>
    `;
    
    modal.style.display = "block";

    // Get the close button
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }
    }

    // Close on click outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Close on ESC key
    const escHandler = function(event) {
        if (event.key === 'Escape' && modal.style.display === "block") {
            modal.style.display = "none";
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

    // Update the playVideo function to only handle the embed link
     function playVideo(embedLink) {
        const container = document.getElementById('video-player-container');
        if (container) {
            container.innerHTML = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="${embedLink}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    // Remove or update the getYouTubeVideoId function since we're using direct embed links now

// Add this function to initialize the deep dive tabs
function initializeDeepDiveTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                
            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

function showEventDetails(event, d) {
    // Update globe with location
    if (!globeSvg) {
        initGlobe();
    }
    updateGlobe(parseFloat(d.latitude), parseFloat(d.longitude));

    // Update event details content
    const eventContent = document.getElementById("event-content");
    const formattedSummary = d.detailed_summary.replace(/\n/g, '</p><p>');
        
    // Check if there's deep dive content
    const hasDeepDive = d.deep_dive_content && Object.keys(d.deep_dive_content).length > 0 && 
        Object.values(d.deep_dive_content).some(arr => arr.length > 0);

     // Add class to event-content based on deep dive availability
    eventContent.className = hasDeepDive ? 'has-deep-dive' : 'no-deep-dive';

    eventContent.innerHTML = `
        <div class="event-details-left">
            <div class="selected-event-header">
                <div id="details-event-title">${d.title.toUpperCase()}</div>
                <div id="details-event-date">${d.date}</div>
                <div id="details-event-location">${d.city}, ${d.state}, ${d.country}</div>
            </div>
            <div class="event-details-grid">
                <div class="detail-item"><span class="detail-title">Time:</span> ${d.time || 'Unknown'}</div>
                <div class="detail-item"><span class="detail-title">Craft Behavior:</span> ${d.craft_behavior}</div>
                <div class="detail-item"><span class="detail-title">CE Scale:</span> ${d.close_encounter_scale}</div>
                <div class="detail-item"><span class="detail-title">Witnesses:</span> ${d.witnesses || 'Unknown'}</div>
            </div>
            <p><span class="detail-title">Summary:</span> ${formattedSummary}</p>
            <div class="rating-system">
                <button class="rating-button like" data-event-id="${d.id}">▲ <span class="like-count">${d.likes}</span></button>
                <button class="rating-button dislike" data-event-id="${d.id}">▼ <span class="dislike-count">${d.dislikes}</span></button>
            </div>
        </div>
        ${hasDeepDive ? `
            <div class="event-details-right">
                ${generateDeepDiveContent(d)}
            </div>
        ` : ''}
    `;

    // Add event listeners for rating buttons
    const likeButton = eventContent.querySelector('.rating-button.like');
    const dislikeButton = eventContent.querySelector('.rating-button.dislike');

    likeButton.addEventListener('click', () => rateEvent(d.id, 'like'));
    dislikeButton.addEventListener('click', () => rateEvent(d.id, 'dislike'));

    // Highlight relevant toggles
    highlightRelevantToggles(d);
}

// Add this function to handle mobile toggle dropdowns
    function initMobileToggles() {
        if (window.innerWidth <= 767) {
            const toggleSections = document.querySelectorAll('.toggle-section');
            toggleSections.forEach(section => {
                const title = section.querySelector('h3');
                title.addEventListener('click', () => {
                    // Close other open sections
                    toggleSections.forEach(otherSection => {
                        if (otherSection !== section) {
                            otherSection.classList.remove('open');
                        }
                    });
                    // Toggle current section
                    section.classList.toggle('open');
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.toggle-section')) {
                    toggleSections.forEach(section => {
                        section.classList.remove('open');
                    });
                }
            });
        }
    }

    // Handle resize events
    window.addEventListener('resize', debounce(() => {
        initMobileToggles();
    }, 250));

    // Add this helper function to process PDF shortcodes if needed
    function processPDFShortcodes() {
        const pdfViewers = document.querySelectorAll('.pdf-viewer');
        pdfViewers.forEach(viewer => {
            const shortcode = viewer.innerHTML.trim();
            if (shortcode.startsWith('[pdf-embedder') && shortcode.endsWith(']')) {
                const urlMatch = shortcode.match(/url="([^"]+)"/);
                if (urlMatch && urlMatch[1]) {
                    const pdfUrl = urlMatch[1];
                    viewer.innerHTML = `<iframe src="${pdfUrl}" width="100%" height="600px" style="border: none;"></iframe>`;
                }
            }
        });
    }

    // Add this to your existing DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // Create and show the sponsor modal
        const sponsorModal = document.createElement('div');
        sponsorModal.id = 'sponsorModal';
        sponsorModal.innerHTML = `
            <div class="sponsor-modal-content">
                <div class="sponsor-header">
                    <img src="https://theufotimeline.com/wp-content/uploads/2024/11/ab6765630000ba8aa4811d1d8c6e2e503a0d385c.jpeg" 
                         alt="Danny Jones" 
                         class="sponsor-image">
                    <div class="sponsor-content">
                        <div class="sponsor-title">Danny Jones Podcast</div>
                        <div class="sponsor-categories">
                            UFOs Science History Conspiracy
                        </div>
                    </div>
                </div>
                <div class="sponsor-buttons">
                    <button class="sponsor-button" onclick="window.open('https://www.youtube.com/@dannyjones', '_blank')">YouTube</button>
                    <button class="sponsor-button" onclick="window.open('https://patreon.com/DannyJones?utm_medium=clipboard_copy&utm_source=copyLink&utm_campaign=creatorshare_fan&utm_content=join_link', '_blank')">Patreon</button>
                    <button class="sponsor-button" onclick="window.open('https://open.spotify.com/show/4VTLG0HiIZaCjH9gE6NFPq', '_blank')">Spotify</button>
                </div>
                <div class="sponsor-subtitle">The UFO Timeline is proudly sponsored by the Danny Jones Podcast.</div>
            </div>
        `;
        
        document.body.appendChild(sponsorModal);
        sponsorModal.style.display = 'block';

        // Auto close after 5 seconds
        setTimeout(() => {
            sponsorModal.style.display = 'none';
        }, 5000);

        // Close modal when clicking outside
        sponsorModal.addEventListener('click', function(event) {
            if (event.target === sponsorModal) {
                sponsorModal.style.display = 'none';
            }
        });
    });

    // Update the dropdown creation code
    document.addEventListener('DOMContentLoaded', function() {
        // Check if top-links exists, if not create it
        let topLinks = document.getElementById('top-links');
        if (!topLinks) {
            topLinks = document.createElement('div');
            topLinks.id = 'top-links';
            document.body.appendChild(topLinks);
        }

        // Create the dropdown structure
        const dropdownHTML = `
            <div class="top-links-dropdown">
                <button class="dropdown-toggle">
                    <div class="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </button>
                <div class="top-links-content">
                    <a href="https://www.paypal.com/ncp/payment/MYKCZ6XC736XL" target="_blank">Donate</a>
                    <a href="https://www.patreon.com/theufotimeline" target="_blank">Patreon</a>
                    <a href="https://youtu.be/MWxLjZcQJ5I" id="tutorial-link" target="_blank">Tutorial</a>
                    <a href="#" id="about-link">About</a>
                </div>
            </div>
        `;

        topLinks.innerHTML = dropdownHTML;

        // Add click handlers
        const dropdownToggle = document.querySelector('.dropdown-toggle');
        const dropdownContent = document.querySelector('.top-links-content');

        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownContent.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            dropdownContent.classList.remove('show');
        });

        // Prevent dropdown from closing when clicking inside it
        dropdownContent.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // Add this to your DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // Create banner art element
        const bannerArt = document.createElement('img');
        bannerArt.src = 'https://theufotimeline.com/wp-content/uploads/2024/11/danny-jones-youtube-banner.png';
        bannerArt.alt = 'Danny Jones Podcast';
        bannerArt.className = 'banner-art';
        
        // Make banner clickable
        bannerArt.addEventListener('click', () => {
            window.open('https://youtu.be/rK-mynKHtHI?si=vkw5ML2Du2kvI37S', '_blank');
        });
        
        // Insert banner after the header container
        const headerContainer = document.getElementById('header-container');
        headerContainer.parentNode.insertBefore(bannerArt, headerContainer.nextSibling);
    });

    // Add this to your DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        // Create footer with social icons
        const footer = document.createElement('div');
        footer.className = 'footer-social';
        
        // Define social media links
        const socialLinks = [
            {
                icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png',
                url: 'https://x.com/theufotimeline',
                alt: 'Twitter'
            },
            {
                icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
                url: 'https://www.youtube.com/@TheUFOTimeline',
                alt: 'YouTube'
            },
            {
                icon: 'https://cdn-icons-png.flaticon.com/512/174/174872.png',
                url: '#', // Empty link for now
                alt: 'Spotify'
            }
        ];

        // Create and append social icons
        socialLinks.forEach(social => {
            const link = document.createElement('a');
            link.href = social.url;
            link.target = '_blank';
            
            const img = document.createElement('img');
            img.src = social.icon;
            img.alt = social.alt;
            img.className = 'social-icon';
            
            link.appendChild(img);
            footer.appendChild(link);
        });

        document.body.appendChild(footer);
    });

    // These functions for event navigation
    function findNextPrevEvents(currentEvent) {
        // Sort events chronologically and apply all active filters
        const sortedEvents = [...ufo_events]
            .filter(d => 
                activeCategories.has(d.category) &&
                (activeCraftTypes.size === 0 || d.craft_type.split(', ').some(type => activeCraftTypes.has(type))) &&
                (activeEntityTypes.size === 0 || d.entity_type.split(', ').some(type => activeEntityTypes.has(type))) &&
                // Update favorites filter to check each color
                (!Object.values(showingOnlyFavorites).some(isActive => isActive) || 
                    Object.entries(showingOnlyFavorites).some(([color, isActive]) => 
                        isActive && favoriteEvents[color] && favoriteEvents[color].has(`${d.category}-${d.date}-${d.time}`)
                    ))
            )
            .sort((a, b) => {
                const dateA = new Date(a.year, getMonthIndex(a.month), a.day);
                const dateB = new Date(b.year, getMonthIndex(b.month), b.day);
                return dateA - dateB;
            });

        const currentIndex = sortedEvents.findIndex(event => 
            event.date === currentEvent.date && 
            event.title === currentEvent.title
        );

        return {
            prev: currentIndex > 0 ? sortedEvents[currentIndex - 1] : null,
            next: currentIndex < sortedEvents.length - 1 ? sortedEvents[currentIndex + 1] : null
        };
    }

    function addNavigationButtons() {
        const navControls = document.createElement('div');
        navControls.className = 'nav-controls';
        navControls.innerHTML = `
            <button id="prevEventBtn" class="event-nav-button" disabled>◄</button>
            <button id="nextEventBtn" class="event-nav-button" disabled>►</button>
        `;
        
        // Insert after the donut chart container
        const donutContainer = document.getElementById('donut-chart-container');
        donutContainer.after(navControls);

        document.getElementById('prevEventBtn').addEventListener('click', () => navigateEvent('prev'));
        document.getElementById('nextEventBtn').addEventListener('click', () => navigateEvent('next'));
    }

function navigateEvent(direction) {
        if (!selectedEvent) return;

        const { prev, next } = findNextPrevEvents(selectedEvent);
        const targetEvent = direction === 'prev' ? prev : next;

        if (targetEvent) {
            // Force select the target event without toggling
            const targetGroup = d3.select(`.event-group[data-id="${targetEvent.category}-${targetEvent.date}-${targetEvent.time}"]`);
            
            // Reset all event groups first
            timelineGroup.selectAll(".event-group")
                .classed('selected', false)
                .each(function() {
                    const group = d3.select(this);
                    group.select('.event-circle').style("display", "block");
                    group.select('.event-rect').style("display", "none");
                    group.select('.event-text-container').style("display", "none");
                });

            // Select the new event
            targetGroup.classed('selected', true);
            targetGroup.select('.event-rect')
                .style("display", "block")
                .raise();
            targetGroup.select('.event-text-container')
                .style("display", "block")
                .raise();
            targetGroup.select('.event-circle')
                .style("display", "none");

            selectedEvent = targetEvent;
            updateEventDetails(targetEvent);
            triggerCategoryToggleHoverEffect(targetEvent.category);
            updateNavigationButtons(targetEvent);

            // Highlight the category row
            svg.selectAll(".category-row-timeline")
                .classed("highlighted", false);
            svg.select(`.category-row-timeline[data-category="${targetEvent.category}"]`)
                .classed("highlighted", true);
        }
}

function updateNavigationButtons(currentEvent) {
        const { prev, next } = findNextPrevEvents(currentEvent);
        const prevBtn = document.getElementById('prevEventBtn');
        const nextBtn = document.getElementById('nextEventBtn');

        if (prevBtn) prevBtn.disabled = !prev;
        if (nextBtn) nextBtn.disabled = !next;
}

    // Add this to your DOMContentLoaded event listener
    document.addEventListener('DOMContentLoaded', function() {
        addNavigationButtons();
});


    // Update the event group creation to handle long press without selecting
function handleEventLongPress(event, d) {
        event.preventDefault();
        event.stopPropagation(); // Prevent event bubbling
        eventLongPressTimer = setTimeout(() => {
            isLongPress = true; // Add this flag to prevent click handling
            showFavoriteOverlay(event, d);
        }, eventLongPressDuration);
}

function showFavoriteOverlay(event, d) {
        // Remove any existing overlays with fade animation
        d3.selectAll('.favorite-overlay')
            .classed('fade-out', true)
            .transition()
            .duration(300)
            .remove();
        
        // Get position relative to the event
        const rect = event.target.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top;
        
        // Create color options
        const colors = ['yellow', 'orange', 'red'];
        colors.forEach((color, index) => {
            const overlay = d3.select('body')
                .append('div')
                .attr('class', `favorite-overlay ${color}`)
                .style('left', `${x + (index - 1) * 15}px`)
                .style('top', y + 'px')
                .on('click', () => {
                    toggleFavorite(d, color);
                    d3.selectAll('.favorite-overlay')
                        .classed('fade-out', true)
                        .transition()
                        .duration(300)
                        .remove();
                });
        });

        // Remove overlays when clicking outside
        d3.select('body').on('click.overlay', function(event) {
            if (!event.target.classList.contains('favorite-overlay')) {
                d3.selectAll('.favorite-overlay')
                    .classed('fade-out', true)
                    .transition()
                    .duration(300)
                    .remove();
                d3.select('body').on('click.overlay', null);
            }
        });
}

function handleEventPressEnd(event, d) {
        if (eventLongPressTimer) {
            clearTimeout(eventLongPressTimer);
            eventLongPressTimer = null;
        }
}

// Update the event click handler to check for long press
function handleEventClick(event, d) {
        event.stopPropagation();
        if (!isLongPress) {
            selectEvent(d, this);
        }
        isLongPress = false; // Reset the flag
}

function toggleFavorite(event, color) {
        const eventId = `${event.category}-${event.date}-${event.time}`;
        const eventGroup = d3.select(`.event-group[data-id="${eventId}"]`);
        
        // Check if this event is already favorited with this color
        if (favoriteEvents[color].has(eventId)) {
            // If same color, just remove it
            favoriteEvents[color].delete(eventId);
            eventGroup.classed(`favorited-${color}`, false);
        } else {
            // Remove from any other color first
            Object.entries(favoriteEvents).forEach(([otherColor, set]) => {
                set.delete(eventId);
                eventGroup.classed(`favorited-${otherColor}`, false);
            });
            // Add to new color
            favoriteEvents[color].add(eventId);
            eventGroup.classed(`favorited-${color}`, true);
        }
        
        // Save to localStorage
        localStorage.setItem('favoriteEvents', JSON.stringify(
            Object.fromEntries(
                Object.entries(favoriteEvents).map(([color, set]) => [color, Array.from(set)])
            )
        ));
        
        const currentTransform = d3.zoomTransform(d3.select("#timeline svg").node());
        const currentXScale = currentTransform.rescaleX(x);
        
        updateEvents(currentXScale);
        updateAllEventPoints();
        drawFavoriteConnections(currentXScale);
}

// Update the favorites toggle button functionality
function addFavoritesToggle() {
        const controlButtons = document.createElement('div');
        controlButtons.className = 'control-buttons';
        
        const colors = ['yellow', 'orange', 'red'];
        colors.forEach(color => {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = `favorites-toggle ${color}`;
            toggleBtn.dataset.color = color;
            
            controlButtons.appendChild(toggleBtn);
        });
        
        const randomizerBtn = document.createElement('button');
        randomizerBtn.className = 'randomizer-button';
        randomizerBtn.innerHTML = '🎲';
        
        controlButtons.appendChild(randomizerBtn);
        
        const donutContainer = document.getElementById('donut-chart-container');
        donutContainer.after(controlButtons);

        // Update click handlers for each color toggle
        controlButtons.querySelectorAll('.favorites-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                showingOnlyFavorites[color] = !showingOnlyFavorites[color];
                btn.classList.toggle('active');
                
                const currentTransform = d3.zoomTransform(d3.select("#timeline svg").node());
                const currentXScale = currentTransform.rescaleX(x);
                
                updateEvents(currentXScale);
                updateDonutChart();
                updateAllEventPoints();
                drawFavoriteConnections(currentXScale); // Add this line to draw the connections
            });
        });

        randomizerBtn.addEventListener('click', startRandomizer);
}

// Load favorites from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
        const savedFavorites = localStorage.getItem('favoriteEvents');
        if (savedFavorites) {
            const parsed = JSON.parse(savedFavorites);
            // Convert the parsed arrays back to Sets
            favoriteEvents = {
                yellow: new Set(parsed.yellow || []),
                orange: new Set(parsed.orange || []),
                red: new Set(parsed.red || [])
            };
        }
        
        addFavoritesToggle();
        
        // Update event groups to include long press handling
        timelineGroup.selectAll(".event-group")
            .on("mousedown touchstart", handleEventLongPress)
            .on("mouseup touchend mouseleave touchcancel", handleEventPressEnd);
});

// Add this function to handle the randomization
function startRandomizer() {
        if (isRandomizing) return;
        isRandomizing = true;
        
        const startTime = Date.now();
        let currentInterval = initialInterval;
        
        function pickRandomEvent() {
            // Get currently visible/filtered events
            const visibleEvents = ufo_events.filter(d => 
                activeCategories.has(d.category) &&
                (activeCraftTypes.size === 0 || d.craft_type.split(', ').some(type => activeCraftTypes.has(type))) &&
                (activeEntityTypes.size === 0 || d.entity_type.split(', ').some(type => activeEntityTypes.has(type)))
            );

            // Apply favorites filter if active
            const filteredEvents = showingOnlyFavorites ? 
                visibleEvents.filter(d => favoriteEvents.has(`${d.category}-${d.date}-${d.time}`)) : 
                visibleEvents;

            // Return random event from filtered list
            return filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
        }

        // Rest of the function remains the same...
        function updateRandomEvent() {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / randomizeDuration, 1);
            
            currentInterval = initialInterval + (finalInterval - initialInterval) * Math.pow(progress, 2);
            
            if (progress >= 1) {
                clearInterval(randomizeInterval);
                isRandomizing = false;
                const finalEvent = pickRandomEvent();
                selectEvent(finalEvent);
                return;
            }

            const randomEvent = pickRandomEvent();
            
            const eventGroup = d3.select(`.event-group[data-id="${randomEvent.category}-${randomEvent.date}-${randomEvent.time}"]`);
            
            timelineGroup.selectAll(".event-group")
                .classed('selected', false)
                .each(function() {
                    const group = d3.select(this);
                    group.select('.event-circle').style("display", "block");
                    group.select('.event-rect').style("display", "none");
                    group.select('.event-text-container').style("display", "none");
                });

            eventGroup.classed('selected', true);
            eventGroup.select('.event-rect')
                .style("display", "block")
                .raise();
            eventGroup.select('.event-text-container')
                .style("display", "block")
                .raise();
            eventGroup.select('.event-circle')
                .style("display", "none");

            updateEventDetails(randomEvent);
            
            clearInterval(randomizeInterval);
            randomizeInterval = setInterval(updateRandomEvent, currentInterval);
        }

        randomizeInterval = setInterval(updateRandomEvent, currentInterval);
}

// Add function to draw favorite connection lines
function drawFavoriteConnections(xScale) {
        // Remove existing connection lines
        timelineGroup.selectAll(".favorite-connection").remove();
        
        if (Object.values(showingOnlyFavorites).some(isActive => isActive)) {
            Object.entries(showingOnlyFavorites).forEach(([color, isActive]) => {
                if (isActive && favoriteEvents[color]) {
                    // Get favorited events for this color and sort chronologically
                    const favoritedEvents = ufo_events
                        .filter(d => favoriteEvents[color].has(`${d.category}-${d.date}-${d.time}`))
                        .sort((a, b) => {
                            const dateA = new Date(a.year, getMonthIndex(a.month), a.day);
                            const dateB = new Date(b.year, getMonthIndex(b.month), b.day);
                            return dateA - dateB;
                        });

                    // Draw timeline connections for this color
                    timelineGroup.selectAll(`.favorite-connection-${color}`)
                        .data(favoritedEvents.slice(0, -1))
                        .enter()
                        .append("line")
                        .attr("class", `favorite-connection favorite-connection-${color}`)
                        .attr("x1", d => xScale(new Date(d.year, getMonthIndex(d.month), d.day)))
                        .attr("y1", d => y(d.category) + y.bandwidth() / 2)
                        .attr("x2", (d, i) => xScale(new Date(favoritedEvents[i + 1].year, 
                            getMonthIndex(favoritedEvents[i + 1].month), 
                            favoritedEvents[i + 1].day)))
                        .attr("y2", (d, i) => y(favoritedEvents[i + 1].category) + y.bandwidth() / 2)
                        .attr("stroke", getColorValue(color))
                        .attr("stroke-width", 1.5)
                        .attr("stroke-dasharray", "4,4")
                        .attr("opacity", 0.6);
                }
            });
        }
}

// Add function to draw globe favorite connections
function drawGlobeFavoriteConnections() {
        const g = globeSvg.select("g");
        g.selectAll(".globe-favorite-connection").remove();
        
        if (Object.values(showingOnlyFavorites).some(isActive => isActive)) {
            Object.entries(showingOnlyFavorites).forEach(([color, isActive]) => {
                if (isActive) {
                    const favoritedEvents = ufo_events
                        .filter(d => favoriteEvents[color].has(`${d.category}-${d.date}-${d.time}`))
                        .sort((a, b) => {
                            const dateA = new Date(a.year, getMonthIndex(a.month), a.day);
                            const dateB = new Date(b.year, getMonthIndex(b.month), b.day);
                            return dateA - dateB;
                        });

                    // Create a great circle generator
                    const geoPath = d3.geoPath().projection(projection);
                    
                    g.selectAll(`.globe-favorite-connection-${color}`)
                        .data(favoritedEvents.slice(0, -1))
                        .enter()
                        .append("path")
                        .attr("class", `globe-favorite-connection globe-favorite-connection-${color}`)
                        .attr("d", (d, i) => {
                            const source = [+d.longitude, +d.latitude];
                            const target = [+favoritedEvents[i + 1].longitude, +favoritedEvents[i + 1].latitude];
                            
                            // Create a great circle path between the two points
                            const greatCircle = d3.geoInterpolate(source, target);
                            
                            // Generate points along the great circle path
                            const points = [];
                            for (let t = 0; t <= 1; t += 0.01) {
                                points.push(greatCircle(t));
                            }
                            
                            // Create a GeoJSON LineString
                            const geoLine = {
                                type: "Feature",
                                geometry: {
                                    type: "LineString",
                                    coordinates: points
                                }
                            };
                            
                            return geoPath(geoLine);
                        })
                        .attr("stroke", getColorValue(color))
                        .attr("stroke-width", 2) // Increased width
                        .style("filter", `drop-shadow(0 0 3px ${getColorValue(color)})`) // Add glow effect
                        .attr("opacity", 0.8) // Increased opacity
                        .attr("fill", "none");
                }
            });
        }
}

// Add this function definition before it's called
function initEventListModal() {
    let modal = document.getElementById("eventListModal");
    if (!modal) {
            modal = document.createElement('div');
            modal.id = "eventListModal";
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="event-list-modal-content">
                <span class="event-list-modal-close">&times;</span>
                <h2 class="event-list-modal-title">Event List</h2>
                <div class="event-list-sort-buttons">
                    <button id="sortChronological" class="event-list-sort-button active">🕒</button>
                    <button id="sortAlphabetical" class="event-list-sort-button">ABC</button>
                </div>
                <ul id="eventList" class="event-list"></ul>
            </div>
        `;

        const closeBtn = modal.querySelector(".event-list-modal-close");
        const sortChronological = document.getElementById("sortChronological");
        const sortAlphabetical = document.getElementById("sortAlphabetical");

        // Show modal
        modal.style.display = "block";

        // Close modal when clicking on X
        closeBtn.onclick = function() {
            modal.style.display = "none";
        }

        // Sort events chronologically
        sortChronological.onclick = function() {
            sortEvents('date');
            sortChronological.classList.add('active');
            sortAlphabetical.classList.remove('active');
        }

        // Sort events alphabetically
        sortAlphabetical.onclick = function() {
            sortEvents('title');
            sortAlphabetical.classList.add('active');
            sortChronological.classList.remove('active');
        }

        // Populate event list (chronologically by default)
        populateEventList('date');

        // Make modal draggable
        makeDraggable(modal);

        // Initialize resizable modal
        initResizableModal(modal);
}

// Helper function to get color values
function getColorValue(color) {
        const colors = {
            yellow: '#FFFF00',
            orange: '#FFA500',
            red: '#FF0000'
        };
        return colors[color];
}

// Global functions (at root level, no indentation)
function openLightbox(imageSrc) {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        
        lightboxImg.src = imageSrc;
        lightbox.style.display = 'flex';

        // Close lightbox when clicking outside the image
        lightbox.onclick = function(e) {
            if (e.target !== lightboxImg) {
                lightbox.style.display = 'none';
            }
        };

        // Close lightbox when clicking the close button
        document.querySelector('.close-lightbox').onclick = function() {
            lightbox.style.display = 'none';
        };
}


// Add lightbox HTML when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('lightbox')) {
        const lightboxHTML = `
            <div id="lightbox" class="lightbox">
                <span class="close-lightbox">&times;</span>
                 <img class="lightbox-content" id="lightbox-img">
            </div>`;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    }
});