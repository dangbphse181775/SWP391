const fs = require('fs');

const path = 'D:/SWP391/FE/src/pages/common/ProductsPage.jsx';
let code = fs.readFileSync(path, 'utf8');

const filterToRemove = `    if (querySellerId) {
      filtered = filtered.filter(product => product.sellerId === querySellerId);
    }`;

if (code.includes(filterToRemove)) {
    code = code.replace(filterToRemove, `    // Frontend filter for \`querySellerId\` is removed because the backend (\`getVehiclesBySeller\`) already returns only this seller's items.`);
    fs.writeFileSync(path, code, 'utf8');
    console.log('Array filter removed!');
} else {
    console.log('Filter not found, maybe slightly different formatting?');
}
