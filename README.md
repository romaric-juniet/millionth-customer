# 1,000,000th Customer Prize  

This program solves [Redmart's challenge](http://geeks.redmart.com/2015/10/26/1000000th-customer-prize-another-programming-challenge/) using javascript and running on node.js.

### Running

The code uses the ES6 currently supported by default by node (developped using v5.6.0). Just run:

```sh
$ node tote-main
```

### Algorithm

0. (Load the data from the file)
1. Fill the bag with the products having the best value/volume ratio
2. Optimize the selection of products by combinatory algorithm (Succesfully optimise)

Step 1 uses a very fast heuristic, but doesn't yield an optimal solution  
Step 2 successfully optimizes the bag of step 1, but requieres a little of tuning

Runs in ~4s
