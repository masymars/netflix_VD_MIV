# Scrollytelling demo using scrollama.js and d3.js
This repository contains a demo setup for *scrollytelling*. It uses scrollama.js and d3.js (v3.5). The setup assumes you have a screen that is at least 1100 pixels wide and it has only been tested on a modern Firefox browser.

## Background

I have created this demo for exploratory purposes. I heard about this thing called *scrollytelling*; a way to scroll through a story while some part of the website sticks around and updates dynamically. It sounded like a great way to tell stories on the web, and that's the very reason I wanted to give it a try. I applied it to the story behind Netflix data. This repository is the result.



## Data and technology

The data is sourced from Netflix, and it includes information about various shows and movies. The Netflix data is structured in GeoJSON format, allowing for geographical visualizations. Additionally, the dataset contains details about the popularity, genres, and other relevant information.

The data are organized into GeoJSON for geographical insights, and other charts include a force simulation, bar chart, bubble chart, pie chart, and stacked pie chart. The data processing and manipulation are done using JavaScript, and the visualizations are created using the D3.js (v3.5) library.


## How to use

With this demo, I aim to showcase the power of scrollytelling using scrollama with D3. The Netflix data is dynamic, and each section of the scrollytelling reveals different aspects of the dataset. The custom code for scrollama is in `scrollama-settings.js`, and the D3 code for visualizations is in `d3-animations.js`.

The magic of this scrollytelling demo is in the interaction between scrollama and D3. Scrollama allows you to trigger specific code at different points in the story. If the code you trigger includes D3 animations, the results are visually engaging and informative.

## Challenges

Scrollama allows you to track where you are in the story (the nth element) and if the user is scrolling up or down. Handling fast scrolling and landing at a specific point are challenges that can be resolved by restarting the user at the beginning.

## What's next

I plan to enhance the project further:

- Change the color scheme for visualizations to improve accessibility.
- Add technical notes to each story element explaining the changes happening in the background.
- Add images and More graphes.
- Continuously improve and optimize the code for better performance and flexibility.
