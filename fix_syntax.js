const fs = require('fs');
const filePath = 'src/app/(dashboard)/admin/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the Manual Invoice dialog specifically
// Look for handleCreateInvoice follow by </form>\s+</div>\s+</DialogContent>
const manualInvoiceRegex = /(<form onSubmit={handleCreateInvoice}[^>]*>[\s\S]*?<\/form>)\s+<\/div>\s+<\/DialogContent>/g;
content = content.replace(manualInvoiceRegex, (match, formBlock) => {
    return formBlock + '\n                                </DialogContent>';
});

fs.writeFileSync(filePath, content);
console.log('Successfully removed erroneous </div> from Manual Invoice dialog');
