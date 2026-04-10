"use client";
import React, { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Card, Tag, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/blogs');
      const data = await res.json();
      if(data.success) {
        setBlogs(data.blogs);
      } else {
        message.error(data.error || 'Failed to fetch blogs');
      }
    } catch (err) {
      message.error('An error occurred while fetching blogs.');
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchBlogs(); 
  }, []);

  const handleDelete = async (id: string) => {
    const hide = message.loading('Deleting...', 0);
    try {
      const res = await fetch(`/api/v1/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.success) {
        message.success('Blog deleted successfully');
        fetchBlogs();
      } else {
        message.error(data.error || 'Failed to delete');
      }
    } catch(err) {
      message.error('An error occurred during deletion.');
    } finally {
      hide();
    }
  };

  return (
    <Card 
      title="Manage Blogs" 
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/v1/admin/blogs/create')}>
          Create Blog
        </Button>
      }
    >
      <Table 
        dataSource={blogs} 
        rowKey="_id" 
        loading={loading} 
        scroll={{ x: 600 }}
        columns={[
          { title: 'Title', dataIndex: 'title' },
          { title: 'Slug', dataIndex: 'slug' },
          { 
            title: 'Status', 
            dataIndex: 'isPublished', 
            render: (val) => val ? <Tag color="green">Published</Tag> : <Tag color="orange">Draft</Tag> 
          },
          { 
            title: 'Published Date', 
            dataIndex: 'publishedAt',
            render: (val) => val ? new Date(val).toLocaleDateString() : 'N/A'
          },
          { 
            title: 'Action', 
            render: (_, record: any) => (
              <Space>
                <Button 
                  icon={<EditOutlined />} 
                  size="small" 
                  onClick={() => router.push(`/v1/admin/blogs/edit/${record._id}`)}
                />
                <Popconfirm title="Are you sure you want to delete this blog?" onConfirm={() => handleDelete(record._id)}>
                  <Button danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
              </Space>
            )
          }
        ]} 
      />
    </Card>
  );
}
