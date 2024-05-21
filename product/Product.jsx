import React from 'react'

type Props = {
    name: string,
    price: number,
    //id: string;
}

function Product({name, price}: Props) {
  return (
    <>
        <div>{name}</div>
        <div>{price}</div>
    </>
  )
}

export default Product