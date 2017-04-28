from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
import math, json, re

def preprocess(rates):
	graph = {}

	pattern = re.compile("([A-Z]{3})_([A-Z]{3})")
	for key in rates:
		matches = pattern.match(key)
		conversion_rate = -math.log(float(rates[key]))
		from_rate = matches.group(1).encode('ascii','ignore')
		to_rate = matches.group(2).encode('ascii','ignore')
		if from_rate != to_rate:
			if from_rate not in graph:
				graph[from_rate] = {}
			graph[from_rate][to_rate] = float(conversion_rate)
	return graph

# Step 1: For each node prepare the destination and predecessor
def initialize(graph, source):
    d = {} # Stands for destination
    p = {} # Stands for predecessor
    for node in graph:
        d[node] = float('Inf') # We start admiting that the rest of nodes are very very far
        p[node] = None
    d[source] = 0 # For the source we know how to reach
    return d, p
 
def retrace_negative_loop(p, start):
	arbitrageLoop = [start]
	next_node = start
	while True:
		if p[next_node] is None:
			return None
		next_node = p[next_node]
		if next_node not in arbitrageLoop:
			arbitrageLoop.append(next_node)
		else:
			arbitrageLoop.append(next_node)
			arbitrageLoop = arbitrageLoop[arbitrageLoop.index(next_node):]
			return arbitrageLoop

def relax(node, neighbour, graph, d, p):
    if d[neighbour] > d[node] + graph[node][neighbour]:
        d[neighbour]  = d[node] + graph[node][neighbour]
        p[neighbour] = node

def bellman_ford(graph, source):
    d, p = initialize(graph, source)
    for i in range(len(graph)-1):
        for u in graph:
            for v in graph[u]:
                relax(u, v, graph, d, p)
    # Negative cycle check
    for u in graph:
        for v in graph[u]:
        	if d[v] < d[u] + graph[u][v]:
        		retrace = retrace_negative_loop(p, source)
        		if retrace is None:
        			return d, p
        		else:
        			return retrace, None
    return d, p



def demo(key):
	rates = {"USD_JPY": "108.51", "USD_USD": "1.0000000", "JPY_EUR": "0.0078314", 
			"BTC_USD": "1203.9889027", "JPY_BTC": "0.00000076", "USD_EUR": "0.93", 
			"EUR_USD": "1.07", "EUR_JPY": "116.3", "JPY_USD": "0.0092", 
			"BTC_BTC": "1.0000000", "EUR_BTC": "0.0000889", "BTC_JPY": "131424.6", 
			"JPY_JPY": "1.0000000", "BTC_EUR": "1123.5", "EUR_EUR": "1.0000000", 
			"USD_BTC": "0.0000827"}

	rates2 = {"USD_JPY": "108.51", "USD_USD": "1.0000000", "JPY_EUR": "0.0078314", 
			"BTC_USD": "1208.9889027", "JPY_BTC": "0.00000076", "USD_EUR": "0.93", 
			"EUR_USD": "1.09", "EUR_JPY": "116.3", "JPY_USD": "0.0092", 
			"BTC_BTC": "1.0000000", "EUR_BTC": "0.0000889", "BTC_JPY": "131424.6", 
			"JPY_JPY": "1.0000000", "BTC_EUR": "1130.5", "EUR_EUR": "1.0000000", 
			"USD_BTC": "0.00011"}

	graph = preprocess(rates)
	path, valid = bellman_ford(graph, key)
	return "USD, BTC, BTC"



	if valid is None:
		if path == None:
			print("No opportunity here :(")
		else:
			money = 100
			#print "Starting with %(money)i in %(currency)s" % {"money":money,"currency":path[0]}

			for i,value in enumerate(path):
				if i+1 < len(path):
					start = path[i]
					end = path[i+1]
					rate = math.exp(-graph[start][end])
					money *= rate
					#print "%(start)s to %(end)s at %(rate)f = %(money)f" % {"start":start,"end":end,"rate":rate,"money":money}
		#print "\n"
	else:
		for key in path:
			path[key] = math.exp(-path[key])
		#print path

PORT_NUMBER = 8080

#This class will handles any incoming request from
#the browser 
class myHandler(BaseHTTPRequestHandler):
	
	#Handler for the GET requests
	def do_GET(self):
		self.send_response(200)
		self.send_header('Content-type','text/html')
		self.send_header("Access-Control-Allow-Origin", "*")
		self.end_headers()
		# Send the html message
		#self.wfile.write("This feature will be up soon! :)")
		self.wfile.write(demo('USD'))
		return
	def do_POST(self):
		return

try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), myHandler)
	print('Started httpserver on port ' , PORT_NUMBER)
	
	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print('^C received, shutting down the web server')
	server.socket.close()










