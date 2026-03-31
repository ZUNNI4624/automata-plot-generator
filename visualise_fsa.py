from graphviz import Digraph

dot = Digraph(comment='Plot Phase Automaton')
dot.node('Setup', 'Setup')
dot.node('RisingAction', 'Rising Action')
dot.node('Climax', 'Climax')
dot.node('Resolution', 'Resolution')

dot.edge('Setup', 'RisingAction')
dot.edge('RisingAction', 'Climax')
dot.edge('Climax', 'Resolution')

dot.render('plot_automaton', view=True)  # opens a PDF