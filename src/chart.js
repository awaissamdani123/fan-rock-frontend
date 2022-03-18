
// import fetch from "node-fetch";
// import ObjectsToCsv from "objects-to-csv";
const ObjectsToCsv = require("../node_modules/objects-to-csv")
const fetch = require('axios')
const { default: axios } = require("axios")
// try {
//     const fetchhh = require("../node_modules/node-fetch")

// } catch (error) {
//     console.log(error)
// }




let settings = { method: "Get" };
let params = {
    page: 1,
    limit: 250,
};
let query = Object.keys(params)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");

function groupByTypeAndCountProducts(products) {

    const groupedByType = products.reduce((group, product) => {
        const type = product.product_type;
        if (!group[type]) {
            group[type] = [];
        }
        group[type].push(product);
        return group;
    }, {});

    const groupArraysTypeAndCount = Object.keys(groupedByType).map((type) => {
        return {
            type,
            productCount: groupedByType[type].length,
        };
    });

    return groupArraysTypeAndCount;
}

function groupByDateAndCountProducts(products) {

    const groupedByDate = products.reduce((group, product) => {
        const date = product.published_at.split("T")[0];
        if (!group[date]) {
            group[date] = [];
        }
        group[date].push(product);
        return group;
    }, {});

    const groupArraysDateAndCount = Object.keys(groupedByDate).map((date) => {
        return {
            date,
            productCount: groupedByDate[date].length,
        };
    });

    return groupArraysDateAndCount;
}


const getResults = async () => {
   
    var productDateData = [];
    var productTypeData = []
    let urlArray = ["https://fanjoy.co/products.json?" + query, "https://gymshark.com/products.json?" + query, "https://ca.ultamodan.com/products.json?" + query];

    // capture stores using Shopify
    for (let i = 0; i < urlArray.length; i++) {

        const JSONproductList = await axios({ method: 'get', url: urlArray[i] })

        const groupedProductsbyDate = groupByDateAndCountProducts(
            JSONproductList.data.products
        );

        productDateData.push(groupedProductsbyDate)


        const groupedProductsbyType = groupByTypeAndCountProducts(
            JSONproductList.data.products
        );
        productTypeData.push(groupedProductsbyType)




    }
  flattedDateData=productDateData.flat();
  flattedTypeData=productTypeData.flat();
    return [flattedDateData, flattedTypeData];
};

function renderTypeChart(data) {
    var ctx = document.getElementById("pieChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: data.map((item) => item.type).slice(1,10),
            datasets: [

                {
                    label: 'Number of Products by this Type',
                    data: data.map((item) => item.productCount),
                    borderColor: 'rgba(192, 192, 192, 1)',
                    backgroundColor: 'Blue',
                }
            ]
        },
        options: {
            

        }

    });
}

function renderChart(data) {
    var ctx = document.getElementById("myChart").getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: {
            labels: data.map((item) => item.date).filter((item) => item),
            datasets: [

                {
                    label: 'Number of Products on this date',
                    data: data.map((item) => item.productCount),
                    borderColor: 'rgba(192, 192, 192, 1)',
                    backgroundColor: 'Red',
                }
            ]
        },
        options: {
            
        }

    });
}

async function getChartData() {

    var [flattedDateData, flattedTypeData] = await getResults();

//    const Date=productDateData[0].concat(productDateData[1]);
//    const Type=productTypeData


    renderChart(flattedDateData);
    renderTypeChart(flattedTypeData);

}


$("#renderBtn").on("click", function () {

    getChartData();
})


