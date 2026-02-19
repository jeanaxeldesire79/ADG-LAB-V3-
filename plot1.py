# plot1.py
import plotly.express as px

fig = px.scatter(x=[1, 2, 3], y=[4, 5, 6], title="Interactive Scatter Plot")
fig.write_html("assets/plots/plot1.html")  # Export HTML version

