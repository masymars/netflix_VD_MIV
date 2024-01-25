function createBarChart() {
    const margin = { top: 50, right: 25, bottom: 45, left: 50 },
        width = 700 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;
        d3.select("#data_viz").selectAll("svg").remove();
        d3.select("#tooltip").remove();

    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#data_viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    function showTooltip(d) {
        tooltip.attr("id", "tooltip")
            .transition()
            .duration(200);
        tooltip
            .style("opacity", 1)
            .html(returnTooltipText(toolTipState, d));
    }

    function hideTooltip(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    d3.csv("./data/netflix_titles.csv").then(function (data) {

        data.forEach(function (d) {
            d.release_year = new Date(d.date_added).getFullYear();
        });

        let countByReleaseYear = d3.nest()
            .key(d => d.release_year.toString()) 
            .rollup(values => values.length)
            .entries(data)
            .map(d => ({ releaseYear: +d.key, count: d.value }));
        countByReleaseYear = countByReleaseYear.filter(d => !isNaN(d.releaseYear));

        const x = d3.scaleBand()
            .domain(countByReleaseYear.map(d => d.releaseYear.toString())) 
            .range([width, 0])
            .padding(0.1);

        const y = d3.scaleLinear().domain([0, d3.max(countByReleaseYear, d => d.count)]).range([height, 0]);

        const xAxis = d3.axisBottom().scale(x);
        const yAxis = d3.axisLeft().scale(y);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "Xaxis axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "white");

        svg.append("g")
            .attr("class", "Yaxis axis")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "white");

            const barChart = svg.selectAll(".bars")
            .data(countByReleaseYear)
            .enter()
            .append("rect")
            .attr("class", "bars")
            .attr("x", d => x(d.releaseYear.toString())) 
            .attr("y", height) 
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .style("fill", "red")
            .on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip)
            .transition() 
            .duration(1000)
            .attr("y", d => y(d.count))
            .attr("height", d => height - y(d.count));

        
    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}



function createStackedBarChart() {
    const margin = { top: 50, right: 25, bottom: 45, left: 50 },
        width = 700 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;
        d3.select("#data_viz").selectAll("svg").remove();
        d3.select("#tooltip").remove();

    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("#data_viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

        function showTooltip(d) {
            const [mouseX, mouseY] = d3.mouse(svg.node()); 
        
            tooltip.attr("id", "tooltip")
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 10}px`) 
                .transition()
                .duration(200);
                
            tooltip
                .style("opacity", 1)
                .html(`<div style="text-align: center;">Year: ${d.data.releaseYear}<br>TV Shows: ${d.data.TVShow}<br>Movies: ${d.data.Movie}</div>`)
                .style("background-color", "white")
                .style("border", "1px solid #ccc") 
                .style("padding", "2px") 
                .style("font-size", "8px") 
                .style("width", "80px") 
                .style("height", "80px") 

                .style("position", "absolute")
                .style("pointer-events", "none"); 
        }

    function hideTooltip(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {

        data.forEach(function (d) {
            d.release_year = new Date(d.date_added).getFullYear();
        });

        let countByReleaseYearAndType = d3.nest()
            .key(d => d.release_year.toString())
            .key(d => d.type) 
            .rollup(values => values.length)
            .entries(data)
            .map(d => ({
                releaseYear: +d.key,
                TVShow: d.values.find(type => type.key === 'TV Show')?.value || 0,
                Movie: d.values.find(type => type.key === 'Movie')?.value || 0
            }));

        countByReleaseYearAndType = countByReleaseYearAndType.filter(d => !isNaN(d.releaseYear));

        const x = d3.scaleBand()
            .domain(countByReleaseYearAndType.map(d => d.releaseYear.toString()))
            .range([width, 0])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(countByReleaseYearAndType, d => d.TVShow + d.Movie)])
            .range([height, 0]);

        const xAxis = d3.axisBottom().scale(x);
        const yAxis = d3.axisLeft().scale(y);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "Xaxis axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "white");

        svg.append("g")
            .attr("class", "Yaxis axis")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "white");

        const stack = d3.stack()
            .keys(["TVShow", "Movie"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(countByReleaseYearAndType);

        const color = d3.scaleOrdinal().domain(["TVShow", "Movie"]).range(["#831010", "#564d4d"]);

        const stackBars = svg.selectAll(".stack-bars")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "stack-bars")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.releaseYear.toString()))
            .attr("y", height) 
            .attr("height", 0) 
            .attr("width", x.bandwidth())
            .on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip)
            .transition() 
            .duration(1000)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]));

       
    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}


function visualizeShowsByCountry() {

    d3.select("#data_viz").selectAll("svg").remove();
    d3.select("#tooltip").remove();

    
    const margin = { top: 50, right: 25, bottom: 45, left: 50 },
        width = 700 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

  
    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Loading...");


        const tooltip = d3.select("#data_viz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip");


    
   
  
    d3.json("./data/countries.json").then(function (world) {
        console.log("World Data:", world);

      
        const center = [0, 0];
        const scale = 110;
        const projection = d3.geoMercator()
            .center(center)
            .scale(scale)
            .translate([width / 2, height / 2]);

    
        const path = d3.geoPath().projection(projection);

       


        d3.csv("./data/netflix_titles.csv").then(function (data) {
            console.log("Netflix Data:", data);

            
            const showsByCountry = {};
            data.forEach(function (d) {
                const countries = d.country.split(',');
                countries.forEach(function (country) {
                    const trimmedCountry = country.trim();
                    if (trimmedCountry) {
                        showsByCountry[trimmedCountry] = (showsByCountry[trimmedCountry] || 0) + 1;
                    }
                });
            });

          
            const aggregatedData = Object.keys(showsByCountry).map(country => ({
                country: country,
                numberOfShows: showsByCountry[country]
            }));
            console.log("Aggregated Data:", aggregatedData);

         
            const maxNumberOfShows = d3.max(aggregatedData, d => d.numberOfShows);

            
            const radiusScale = d3.scaleLinear()
                .domain([0, maxNumberOfShows])
                .range([0, 100]);

      
            svg.selectAll("text").remove();
            function showTooltip(name,d) {
                const countryName = name;
                const numberOfShows = showsByCountry[countryName] || 0;
            
                const [mouseX, mouseY] = d3.mouse(svg.node()); 
            
                tooltip.attr("id", "tooltip")
                    .style("left", `${mouseX}px`)
                    .style("top", `${mouseY - 10}px`)
                    .transition()
                    .duration(200);
            
                tooltip
                    .style("opacity", 1)
                    .html(`<div style="text-align: center;">${countryName}<br>Number of Shows: ${numberOfShows}</div>`)
                    .style("background-color", "white")
                    .style("border", "1px solid #ccc") 
                    .style("padding", "2px") 
                    .style("font-size", "12px") 
                    .style("width", "120px") 
                    .style("height", "80px") 
                    .style("position", "absolute")
                    .style("pointer-events", "none"); 
            }
            
            function hideTooltip(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
            }

            svg.selectAll('path')
    .data(world.features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('fill', 'black')
    .style('stroke', 'white')
    .style('stroke-width', '1px')
    .on("mouseover", function(d) {
        showTooltip(d.properties.name, d);
    })
    .on("mouseout", hideTooltip);
    

        const colorScale = d3.scaleLinear()
    .domain([0, d3.max(aggregatedData, d => d.numberOfShows)])
    .range(["#831010", "#D58686"]);

const circles = svg.selectAll("circle")
    .data(aggregatedData)
    .enter()
    .append("circle")
    .attr("cx", d => projection(getCountryCoordinates(world, d.country))[0])
    .attr("cy", d => projection(getCountryCoordinates(world, d.country))[1])
    .attr("r", 0)
    .style("fill", d => colorScale(d.numberOfShows)) 
    .style("opacity", 0.7)
    .on("mouseover", function(d) {
        showTooltip(d.country, d);
    })
    .on("mouseout", hideTooltip)
    .transition()
    .duration(1000)
    
    .attr("r", d => radiusScale(d.numberOfShows));
    

            

        }).catch(function (error) {
            console.error("Error loading Netflix data:", error);
        });
    }).catch(function (error) {
        console.error("Error loading world data:", error);
    });
}

function getCountryCoordinates(world, countryName) {
    const features = world.features;

    if (!features || !Array.isArray(features)) {
        console.error("Invalid features data:", features);
        return [0, 0]; 
    }

    const countryFeature = features.find(feature => feature.properties.name === countryName);

    return countryFeature ? d3.geoCentroid(countryFeature) : [0, 0];
}





function createGenreCountBarChart() {
    const margin = { top: 10, right: 25, bottom: 10, left: 150 },
        width = 700 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    d3.select("#data_viz").selectAll("svg").remove();
    d3.select("#tooltip").remove();

    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {

        const genresCount = {};

        data.forEach(function (d) {
            const genres = d.listed_in.split(',').map(genre => genre.trim());
            genres.forEach(function (genre) {
                genresCount[genre] = (genresCount[genre] || 0) + 1;
            });
        });

        const genresData = Object.keys(genresCount).map(genre => ({
            genre: genre,
            count: genresCount[genre]
        }));

        genresData.sort((a, b) => b.count - a.count);

        const x = d3.scaleLinear()
            .domain([0, d3.max(genresData, d => d.count)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(genresData.map(d => d.genre))
            .range([0, height]) 
            .padding(0.2) 
            .paddingOuter(0.4); 

        const xAxis = d3.axisBottom().scale(x);
        const yAxis = d3.axisLeft().scale(y);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`) 
            .attr("class", "Xaxis axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "white")
            .attr("dy", "-0.5em") 
            .attr("text-anchor", "middle") 
            .transition() 
            .duration(1000);

        svg.append("g")
            .attr("class", "Yaxis axis")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "white");

        svg.selectAll("rect")
            .data(genresData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => y(d.genre))
            .attr("width", 0) 
            .attr("height", y.bandwidth()) 
            .attr("fill", "#831010") 
            .on("mouseover", function (d) {
                showTooltip(d);
            })
            .on("mouseleave", hideTooltip)
            .transition() 
            .duration(1000)
            .attr("width", d => x(d.count));

   
            const tooltip = d3.select("#data_viz")
            
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");
    
            function showTooltip(d) {
                const [mouseX, mouseY] = d3.mouse(svg.node()); 
            
                tooltip.attr("id", "tooltip")
                    .style("left", `${mouseX}px`)
                    .style("top", `${mouseY - 10}px`) 
                    .transition()
                    .duration(200);
                    
                tooltip
                    .style("opacity", 1)
                    .html(`<div  style="text-align: center;">Genre: ${d.genre}<br>Number of Films: ${d.count}</div>`)
                    .style("background-color", "white")
                    .style("border", "1px solid #ccc") 
                    .style("padding", "2px") 
                    .style("font-size", "8px")
                    .style("width", "80px")
                    .style("height", "80px") 
    
                    .style("position", "absolute")
                    .style("pointer-events", "none"); 
            }
    
            function hideTooltip() {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }

    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}



function createRatingPieChart() {
    const margin = { top: 10, right: 25, bottom: 10, left: 150 },
    width = 700 - margin.left - margin.right,
    height = 420 - margin.top - margin.bottom;
  
    const radius = Math.min(width, height) / 2;

    d3.select("#data_viz").selectAll("svg").remove();
    d3.select("#tooltip").remove();

    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {

        const ratingCount = {};

        data.forEach(function (d) {
            const rating = d.rating;
            ratingCount[rating] = (ratingCount[rating] || 0) + 1;
        });

        const ratingData = Object.keys(ratingCount).map(rating => ({
            rating: rating,
            count: ratingCount[rating]
        }));

        ratingData.sort((a, b) => b.count - a.count);

        const color = d3.scaleOrdinal(d3.schemeCategory10);


        
        const pie = d3.pie()
            .value(d => d.count);

        const arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        const arcs = svg.selectAll("arc")
            .data(pie(ratingData))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", (d, i) => color(i))
            .on("mouseover", function (d) {
                showTooltip(d.data);
            })
            .on("mouseleave", hideTooltip);

            const legend = svg.selectAll(".legend")
            .data(pie(ratingData))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width - 150},${i * 30})`);
        
        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", (d, i) => color(i));
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d.data.rating);
        
       
        const tooltip = d3.select("#data_viz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

        function showTooltip(d) {
            tooltip.attr("id", "tooltip")
                .style("left", `${width / 2}px`)
                .style("top", `${height / 2}px`)
                .transition()
                .duration(200);

            tooltip
                .style("opacity", 1)
                .html(`<div  style="text-align: center;">Rating: ${d.rating}<br>Number of Films: ${d.count}</div>`)
                .style("background-color", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "10px")
                .style("font-size", "12px")
                .style("width", "150px")
                .style("height", "80px")
                .style("position", "absolute")
                .style("pointer-events", "none");
        }

        function hideTooltip() {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }

    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}

function createStackedBarChartconutery(selection, country, key, title, xLabel, yLabel) {
    const margin = { top: 50, right: 25, bottom: 20, left: 50 },
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;
        selection.selectAll("svg").remove();

        const svg = selection.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = selection
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    function showTooltip(d) {
        const [mouseX, mouseY] = d3.mouse(svg.node()); // Get mouse coordinates relative to the SVG container

        tooltip.attr("id", "tooltip")
            .style("left", `${mouseX}px`)
            .style("top", `${mouseY - 10}px`) // Adjust the vertical position as needed
            .transition()
            .duration(200);

        tooltip
            .style("opacity", 1)
            .html(`<div style="text-align: center; color: black; font-size: 80%;">Year: ${d.data.releaseYear}<br>TV Shows: ${d.data.TVShow}<br>Movies: ${d.data.Movie}</div>`)
            .style("background-color", "white")
            .style("border", "1px solid #ccc") // Add border for better visibility
            .style("padding", "2px") // Reduce padding for a smaller tooltip
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("height", "80px")
            .style("width", "80px");
    }

    function hideTooltip(d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {
        // Filter data for the specified country
        data = data.filter(d => d.country && d.country.includes(country));

        // Process the data
        data.forEach(function (d) {
            d.release_year = new Date(d.date_added).getFullYear();
        });

        let countByReleaseYearAndType = d3.nest()
            .key(d => d.release_year.toString())
            .key(d => d.type) // Split by 'type' (TV Show or Movie)
            .rollup(values => values.length)
            .entries(data)
            .map(d => ({
                releaseYear: +d.key,
                TVShow: d.values.find(type => type.key === 'TV Show')?.value || 0,
                Movie: d.values.find(type => type.key === 'Movie')?.value || 0
            }));

        countByReleaseYearAndType = countByReleaseYearAndType
            .filter(d => !isNaN(d.releaseYear));

        const x = d3.scaleBand()
            .domain(countByReleaseYearAndType.map(d => d.releaseYear.toString()))
            .range([width, 0])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(countByReleaseYearAndType, d => d.TVShow + d.Movie)])
            .range([height, 0]);

        const xAxis = d3.axisBottom().scale(x);
        const yAxis = d3.axisLeft().scale(y);


         // Append title to the top
         svg.append("text")
         .attr("x", width / 2)
         .attr("y", -20)
         .style("text-anchor", "middle")
         .style("font-size", "16px")
         .style("font-weight", "bold")
         .text(title);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "Xaxis axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "black") // Set text color to black
            .style("font-size", "80%"); // Reduce font size by 20%

        svg.append("g")
            .attr("class", "Yaxis axis")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "black") // Set text color to black
            .style("font-size", "80%"); // Reduce font size by 20%

        const stack = d3.stack()
            .keys(["TVShow", "Movie"])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(countByReleaseYearAndType);

        const color = d3.scaleOrdinal().domain(["TVShow", "Movie"]).range(["#831010", "#564d4d"]);

        const stackBars = svg.selectAll(".stack-bars")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("class", "stack-bars")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => x(d.data.releaseYear.toString()))
            .attr("y", height) // Initial height for smooth entry animation
            .attr("height", 0) // Initial height for smooth entry animation
            .attr("width", x.bandwidth())
            .on("mouseover", showTooltip)
            .on("mouseleave", hideTooltip)
            .transition() // Apply smooth transition for enter animation
            .duration(1000)
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]));

        // Other code related to your visualization
    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}


function createGenreCountBarChartCountry(selection, country, key, title, xLabel, yLabel) {
    const margin = { top: 50, right: 25, bottom: 20, left: 150 },
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    selection.selectAll("svg").remove();

    const svg = selection
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

   

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {

        const genresCount = {};
        data = data.filter(d => d.country && d.country.includes(country));
        data.forEach(function (d) {
            const genres = d.listed_in.split(',').map(genre => genre.trim());
            genres.forEach(function (genre) {
                genresCount[genre] = (genresCount[genre] || 0) + 1;
            });
        });

        const genresData = Object.keys(genresCount)
            .map(genre => ({ genre: genre, count: genresCount[genre] }))
            .sort((a, b) => b.count - a.count) // Sort by count in descending order
            .slice(0, 20); // Select only the top 20 genres

        const x = d3.scaleLinear()
            .domain([0, d3.max(genresData, d => d.count)])
            .range([0, width]);

        const y = d3.scaleBand()
            .domain(genresData.map(d => d.genre))
            .range([0, height])
            .padding(0.2)
            .paddingOuter(0.4);

        const xAxis = d3.axisBottom().scale(x);
        const yAxis = d3.axisLeft().scale(y);
// Append title to the top
svg.append("text")
.attr("x", width / 2)
.attr("y", -20)
.style("text-anchor", "middle")
.style("font-size", "16px")
.style("font-weight", "bold")
.text(title);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class", "Xaxis axis")
            .call(xAxis)
            .selectAll("text")
            .style("fill", "black")
            .attr("dy", "-0.5em")
            .attr("text-anchor", "middle")
            .transition()
            .duration(1000);

        svg.append("g")
            .attr("class", "Yaxis axis")
            .call(yAxis)
            .selectAll("text")
            .style("fill", "black");

        svg.selectAll("rect")
            .data(genresData)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", d => y(d.genre))
            .attr("width", 0)
            .attr("height", y.bandwidth())
            .attr("fill", "#831010")
            .on("mouseover", function (d) {
                showTooltip(d);
            })
            .on("mouseleave", hideTooltip)
            .transition()
            .duration(1000)
            .attr("width", d => x(d.count));

        const tooltip = selection
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

        function showTooltip(d) {
            const [mouseX, mouseY] = d3.mouse(svg.node());

            tooltip.attr("id", "tooltip")
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 10}px`)
                .transition()
                .duration(200);

            tooltip
                .style("opacity", 1)
                .html(`<div  style="text-align: center;">Genre: ${d.genre}<br>Number of Films: ${d.count}</div>`)
                .style("background-color", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "2px")
                .style("font-size", "8px")
                .style("width", "80px")
                .style("height", "80px")
                .style("position", "absolute")
                .style("pointer-events", "none");
        }

        function hideTooltip() {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }

    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
}

function createRatingBubbleChartCountry(selection, country, key, title, xLabel, yLabel) {
    const margin = { top: 50, right: 25, bottom: 20, left: 150 },
        width = 350 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    selection.selectAll("svg").remove();

    const svg = selection
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Load data from CSV file
    d3.csv("./data/netflix_titles.csv").then(function (data) {

        const ratingsCount = {};
        data = data.filter(d => d.country && d.country.includes(country));
        data.forEach(function (d) {
            const rating = d.rating.trim();
            ratingsCount[rating] = (ratingsCount[rating] || 0) + 1;
        });

        const ratingsData = Object.keys(ratingsCount)
            .map(rating => ({ rating: rating, count: ratingsCount[rating] }));

        const maxCount = d3.max(ratingsData, d => d.count);

        const radius = d3.scaleSqrt()
            .domain([0, maxCount])
            .range([15, 30]); // Adjust the range for bubble sizes

        const simulation = d3.forceSimulation(ratingsData)
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("charge", d3.forceManyBody().strength(20))
            .force("collide", d3.forceCollide().radius(d => radius(d.count) + 2).iterations(4)); // Increase iterations for better fitting

        simulation.on("tick", () => {
            svg.selectAll("circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            svg.selectAll("text")
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        svg.selectAll("circle")
            .data(ratingsData)
            .enter()
            .append("circle")
            .attr("r", d => radius(d.count))
            .attr("fill", () => getRandomColor())
            .style("opacity", 0.7)
            .on("mouseover", function (d) {
                showTooltip(d);
            })
            .on("mouseleave", hideTooltip);

        svg.selectAll("text")
            .data(ratingsData)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill", "white")
            .text(d => d.rating);

        const tooltip = selection
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip");

        function showTooltip(d) {
            const [mouseX, mouseY] = d3.mouse(svg.node());

            tooltip.attr("id", "tooltip")
                .style("left", `${mouseX}px`)
                .style("top", `${mouseY - 10}px`)
                .transition()
                .duration(200);

            tooltip
                .style("opacity", 1)
                .html(`<div style="text-align: center;">Rating: ${d.rating}<br>Number of Items: ${d.count}</div>`)
                .style("background-color", "white")
                .style("border", "1px solid #ccc")
                .style("padding", "2px")
                .style("font-size", "8px")
                .style("width", "100px")
                .style("height", "60px")
                .style("position", "absolute")
                .style("pointer-events", "none");
        }

        function hideTooltip() {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }

        // Function to generate a random color
        function getRandomColor() {
            const letters = '0123456789ABCDEF';
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }

    }).catch(function (error) {
        console.error("Error loading data:", error);
    });
    // Append title to the top
svg.append("text")
.attr("x", width / 2)
.attr("y", 200)
.style("text-anchor", "middle")
.style("font-size", "16px")
.style("font-weight", "bold")
.text(title);
}

function createStackedlineChartWithDuration(selection, country, key, title, xLabel, yLabel) {
    const margin = { top: 50, right: 25, bottom: 20, left: 50 },
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;
selection.selectAll("svg").remove();

const svg = selection.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = selection
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip");

function showTooltip(d) {
    const [mouseX, mouseY] = d3.mouse(svg.node());

    tooltip.attr("id", "tooltip")
        .style("left", `${mouseX}px`)
        .style("top", `${mouseY - 10}px`)
        .transition()
        .duration(200);

    tooltip
        .style("opacity", 1)
        .html(`<div style="text-align: center; color: black; font-size: 80%;">Year: ${d.data.releaseYear}<br>Movies Duration: ${formatDuration(d.data.movieDuration)}<br>TV Shows Duration: ${formatDuration(d.data.tvShowDuration)}</div>`)
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "2px")
        .style("position", "absolute")
        .style("pointer-events", "none")
        .style("height", "100px")
        .style("width", "140px");
}

function hideTooltip(d) {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
}

// Load data from CSV file
d3.csv("./data/netflix_titles.csv").then(function (data) {
    // Filter data for the specified country
    data = data.filter(d => d.country && d.country.includes(country));

    // Process the data
    data.forEach(function (d) {
        d.release_year = new Date(d.date_added).getFullYear();
        d.duration = parseDuration(d.duration);
    });

    let totalDurationByYear = d3.nest()
        .key(d => d.release_year.toString())
        .rollup(values => ({
            movieDuration: d3.sum(values.filter(d => d.type === 'Movie'), d => d.duration),
            tvShowDuration: d3.sum(values.filter(d => d.type === 'TV Show'), d => d.duration),
        }))
        .entries(data)
        .map(d => ({
            releaseYear: +d.key,
            movieDuration: d.value.movieDuration || 0,
            tvShowDuration: d.value.tvShowDuration || 0,
        }));

    totalDurationByYear = totalDurationByYear
        .filter(d => !isNaN(d.releaseYear));

    const x = d3.scaleBand()
        .domain(totalDurationByYear.map(d => d.releaseYear.toString()))
        .range([width, 0])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(totalDurationByYear, d => Math.max(d.movieDuration, d.tvShowDuration))])
        .range([height, 0]);

    const xAxis = d3.axisBottom().scale(x);
    const yAxis = d3.axisLeft().scale(y);

    // Append title to the top
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "Xaxis axis")
        .call(xAxis)
        .selectAll("text")
        .style("fill", "black")
        .style("font-size", "80%");

    svg.append("g")
        .attr("class", "Yaxis axis")
        .call(yAxis)
        .selectAll("text")
        .style("fill", "black")
        .style("font-size", "80%");

    const lineMovie = d3.line()
        .x(d => x(d.releaseYear.toString()))
        .y(d => y(d.movieDuration));

    svg.append("path")
        .datum(totalDurationByYear)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("d", lineMovie);

    const lineTvShow = d3.line()
        .x(d => x(d.releaseYear.toString()))
        .y(d => y(d.tvShowDuration));
        
    svg.append("path")
        .datum(totalDurationByYear)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", lineTvShow);

    // Other code related to your visualization
}).catch(function (error) {
    console.error("Error loading data:", error);
});

function parseDuration(duration) {
    // Implement your own logic to parse duration string and convert it to minutes
    // For example, you can split the string and calculate the total minutes
    return parseInt(duration.split(' ')[0]) || 0;
}

function formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
}
}


function createStackedBarChartCountrygenre(selection, country, key, title, xLabel, yLabel) {
    const margin = { top: 50, right: 25, bottom: 20, left: 50 },
    width = 350 - margin.left - margin.right,
    height = 250 - margin.top - margin.bottom;

selection.selectAll("svg").remove();

const svg = selection.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = selection
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip");

    function showTooltip(d) {
        const [mouseX, mouseY] = d3.mouse(svg.node());

        tooltip.attr("id", "tooltip")
            .style("left", `${mouseX}px`)
            .style("top", `${mouseY - 10}px`)
            .transition()
            .duration(200);

        const genreCounts = Object.entries(d.data).filter(([key]) => key !== "releaseYear");

        tooltip
            .style("opacity", 1)
            .html(`
                <div style="text-align: center; color: black; font-size: 40%;">
                    <div style="float: left; width: 50%;">
                        Year: ${d.data.releaseYear}<br>
                        ${genreCounts.slice(0, Math.ceil(genreCounts.length / 2)).map(([genre, count]) => `${genre}: ${count}`).join('<br>')}
                    </div>
                    <div style="float: left; width: 50%;">
                        ${genreCounts.slice(Math.ceil(genreCounts.length / 2)).map(([genre, count]) => `${genre}: ${count}`).join('<br>')}
                    </div>
                </div>
            `)
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "2px")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("height", `max(${Math.max(genreCounts.length / 2 * 20, 40)}px, 200px)`) // Adjusted height dynamically with a minimum of 200px
            .style("width", "160px");
    }

function hideTooltip() {
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 0);
}

// Load data from CSV file
d3.csv("./data/netflix_titles.csv").then(function (data) {
  
    data = data.filter(d => d.country && d.country.includes(country));


    data.forEach(function (d) {
        d.release_year = new Date(d.date_added).getFullYear();
    });

    const countByReleaseYearAndGenre = d3.nest()
        .key(d => d.release_year.toString())
        .key(d => d.listed_in)
        .rollup(values => values.length)
        .entries(data)
        .map(d => {
            const genreCounts = {};
            d.values.forEach(genreData => {
                genreCounts[genreData.key] = genreData.value;
            });
            return { releaseYear: +d.key, ...genreCounts };
        });

    const stackedData = d3.stack()
        .keys(Object.keys(countByReleaseYearAndGenre[0]).filter(key => key !== "releaseYear"))
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)(countByReleaseYearAndGenre);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const x = d3.scaleBand()
        .domain(countByReleaseYearAndGenre.map(d => d.releaseYear.toString()))
        .range([width, 0])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])])
        .range([height, 0]);

    const xAxis = d3.axisBottom().scale(x);
    const yAxis = d3.axisLeft().scale(y);


    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "Xaxis axis")
        .call(xAxis)
        .selectAll("text")
        .style("fill", "black") 
        .style("font-size", "80%"); 

    svg.append("g")
        .attr("class", "Yaxis axis")
        .call(yAxis)
        .selectAll("text")
        .style("fill", "black") 
        .style("font-size", "80%"); 

    const stackBars = svg.selectAll(".stack-bars")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "stack-bars")
        .attr("fill", (d, i) => color(i))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => x(d.data.releaseYear.toString()))
        .attr("y", height)
        .attr("height", 0)
        .attr("width", x.bandwidth())
        .on("mouseover", showTooltip)
        .on("mouseleave", hideTooltip)
        .transition()
        .duration(1000)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]));

}).catch(function (error) {
    console.error("Error loading data:", error);
});
}
function visualizeShowsByCountry2() {
    // Remove existing SVG to refresh the visualization
    d3.select("#data_viz").selectAll("svg").remove();
    d3.select("#tooltip").remove();

    // Set up margins and dimensions
    const margin = { top: 50, right: 25, bottom: 45, left: 50 },
        width = 700 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // Create an SVG container
    const svg = d3.select("#data_viz")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Loading animation while fetching data
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Loading...");

    const tooltip = d3.select("#data_viz")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    // Fetch world data (countries)
    d3.json("./data/countries.json").then(function (world) {
        console.log("World Data:", world);

        // Projection settings
        const center = [0, 0];
        const scale = 110;
        const projection = d3.geoMercator()
            .center(center)
            .scale(scale)
            .translate([width / 2, height / 2]);

        // Path generator
        const path = d3.geoPath().projection(projection);

        // Fetch Netflix data (shows by country)
        d3.csv("./data/netflix_titles.csv").then(function (data) {
            console.log("Netflix Data:", data);

            // Aggregate data by country
            const showsByCountry = {};
            data.forEach(function (d) {
                const countries = d.country.split(',');
                countries.forEach(function (country) {
                    const trimmedCountry = country.trim();
                    if (trimmedCountry) {
                        showsByCountry[trimmedCountry] = (showsByCountry[trimmedCountry] || 0) + 1;
                    }
                });
            });

            // Format data for visualization
            const aggregatedData = Object.keys(showsByCountry).map(country => ({
                country: country,
                numberOfShows: showsByCountry[country]
            }));
            console.log("Aggregated Data:", aggregatedData);

            // Calculate the maximum number of shows dynamically
            const maxNumberOfShows = d3.max(aggregatedData, d => d.numberOfShows);

            // Define a linear scale for the intensity of red color
            const intensityScale = d3.scaleLinear()
                .domain([0, maxNumberOfShows])
                .range([0, 10]);


            
        const modal = d3.select("body").append("div")
        .attr("class", "modal")
        .attr("id", "myModal")  // Add an ID to the modal
        .style("display", "none");

    // Append close button (exit logo)
    modal.append("span")
        .attr("class", "close")
        .html("&times;")
        .on("click", function() {
            modal.style("display", "none");
        });
        modal.append("div")
        .attr("class", "country-name")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("position", "absolute")
        .style("top", "20px")
        .style("left", "20px");
        // Append container for the first row
modal.append("div")
.attr("id", "modal-row1")
.style("display", "flex");

// Append container for the second row
modal.append("div")
.attr("id", "modal-row2")
.style("display", "flex");

// Append charts to the first row
for (let i = 1; i <= 3; i++) {
const chartContainer = d3.select("#modal-row1")
    .append("div")
    .attr("class", "modal-chart")
    .style("margin-right", "30px"); // Adjust margin as needed

// Append the chart to the chartContainer (replace this line with your chart creation logic)
chartContainer.append("div")
    .attr("id", `modal-chart${i}`)
    .style("margin-top", "30px"); // Adjust margin as needed
}

for (let i = 1; i <= 3; i++) {
    const chartContainer = d3.select("#modal-row2")
        .append("div")
        .attr("class", "modal-chart")
        .style("margin-right", "30px"); // Adjust margin as needed
    
    // Append the chart to the chartContainer (replace this line with your chart creation logic)
    chartContainer.append("div")
        .attr("id", `modal-chart2${i}`)
        .style("margin-top", "30px"); // Adjust margin as needed
    }
    // Function to show charts in the modal
    function showChartsInModal(countryName) {
        // Filter data for the selected country
        const countryData = data.filter(d => d.country.includes(countryName));
    
        // Set the country name in the modal
        modal.select(".country-name").text(countryName);
    
        d3.select("#modal-chart1")
            .call(createStackedBarChartconutery, countryName, "release_year", "Number of Shows Each Year", "Year", "Count");
    
        d3.select("#modal-chart2")
            .call(createGenreCountBarChartCountry, countryName, "listed_in", "Number of Shows for  Genre", "Genre", "Count");
        d3.select("#modal-chart3")
            .call(createRatingBubbleChartCountry, countryName, "listed_in", "Number of Shows for  Rating", "Genre", "Count");
            d3.select("#modal-chart21")
            .call(createStackedlineChartWithDuration, countryName, "listed_in", "Total duration for Each Year", "Genre", "Count");


            d3.select("#modal-chart22")
            .call(createStackedBarChartCountrygenre, countryName, "listed_in", "Genres Of Each Year", "Genre", "Count");
        // Display the modal
        modal.style("display", "block");
    }
    
            
            // Update the fill color of each country
            svg.selectAll('path')
            .data(world.features)
            .enter()
            .append('path')
            .attr('d', path)
            .style('fill', d => {
                const countryName = d.properties.name;
                const numberOfShows = showsByCountry[countryName] || 0;
                const intensity = intensityScale(numberOfShows);
                return `rgba(255, 0, 0, ${intensity})`; // Red color with intensity based on the number of shows
            })
            .style('stroke', 'white')
            .style('stroke-width', '1px')
            .on("mouseover", function(d) {
                showTooltip(d.properties.name, d);
            })
            .on("mouseout", hideTooltip)
            .on("click", function(d) {
                showChartsInModal(d.properties.name);
            });

            function showTooltip(name, d) {
                const countryName = name;
                const numberOfShows = showsByCountry[countryName] || 0;

                const [mouseX, mouseY] = d3.mouse(svg.node()); // Get mouse coordinates relative to the SVG container

                tooltip.attr("id", "tooltip")
                    .style("left", `${mouseX}px`)
                    .style("top", `${mouseY - 10}px`) // Adjust the vertical position as needed
                    .transition()
                    .duration(200);

                tooltip
                    .style("opacity", 1)
                    .html(`<div style="text-align: center;">${countryName}<br>Number of Shows: ${numberOfShows}</div>`)
                    .style("background-color", "white")
                    .style("border", "1px solid #ccc") // Add border for better visibility
                    .style("padding", "2px") // Reduce padding for a smaller tooltip
                    .style("font-size", "12px") // Adjust text size
                    .style("width", "120px") // Set a fixed width for the tooltip
                    .style("height", "80px") // Set a fixed width for the tooltip
                    .style("position", "absolute")
                    .style("pointer-events", "none"); // Make sure the tooltip doesn't interfere with mouse events
            }

            function hideTooltip(d) {
                tooltip
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
            }

        }).catch(function (error) {
            console.error("Error loading Netflix data:", error);
        });
    }).catch(function (error) {
        console.error("Error loading world data:", error);
    });
}
