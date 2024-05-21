import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Product from './Product';

function ProductList() {

    const [products, setProducts] = useState([]);

    useEffect(()=> {
        const getProducts = async () => {
            const res = await axios.get("http://localhost:3000/products");
            // `http://localhost:3000/products/${id}`, values
            console.log('res: ',res.data);
            setProducts(res.data);
        }
        getProducts();
    }, [])

    return (
        <div>
            {products.map((product: any, index:number) => (
                <div key={index}>
                    <Product name={product.productName} price={product.price} key={product.index}/>
                </div>
            ))}
        </div>
    );
    
}

export default ProductList