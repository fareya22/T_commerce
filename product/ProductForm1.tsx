import { Button, Form, Input } from 'antd';
import axios from 'axios';
import React from 'react';

type FieldType = {
  productName?: string;
  price?: number;
};

function ProductForm() {

    const onFinish = async (values: any) => {
        try {
            console.log('Success:', values);
            const res = await axios.post("http://localhost:3000/products", values);
            console.log(res.data);  // Logging the response data
        } catch (error) {
            console.error('Error:', error); // Log any error that occurs during the request
        }
    };
      
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: 600 }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    label="Product er naam den"
                    name="productName"
                    rules={[{ required: true, message: 'Please input your product name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item<FieldType>
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please input your price!' }]}
                >
                    <Input type='number' />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ProductForm;
