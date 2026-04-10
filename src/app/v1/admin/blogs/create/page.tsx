"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, Switch, message, Card, Upload, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { useRouter } from 'next/navigation';

const { Dragger } = Upload;

export default function CreateBlog() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const pasteRef = useRef<HTMLDivElement>(null);

  const uploadToImageKit = async (file: RcFile) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`)}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        form.setFieldsValue({ coverImage: data.url });
        message.success("Image uploaded successfully!");
      } else {
        message.error("Image upload failed.");
      }
    } catch (err) {
      message.error("Upload failed.");
      console.error(err);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) uploadToImageKit(file as RcFile);
        }
    }
  };

  useEffect(() => {
    const div = pasteRef.current;
    if (div) div.addEventListener("paste", handlePaste as any);
    return () => { if (div) div.removeEventListener("paste", handlePaste as any); };
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    
    // Convert tags string to an array array if needed
    const payload = { ...values };
    if (typeof payload.tags === 'string') {
      payload.tags = payload.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }
    
    try {
      const res = await fetch('/api/v1/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if(data.success) {
        message.success('Blog created successfully');
        router.push('/v1/admin/blogs');
      } else {
        message.error(data.error || 'Failed to create blog');
      }
    } catch(err) {
      message.error('An error occurred during creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create New Blog">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter title' }]}>
          <Input placeholder="Enter the blog title" />
        </Form.Item>

        <Form.Item name="excerpt" label="Excerpt">
          <Input.TextArea rows={2} placeholder="A short description of the blog (optional)" />
        </Form.Item>

        {/* Basic HTML text area for now. We can easily swap this out for a rich text editor later */}
        <Form.Item name="content" label="Content (HTML / Markdown depending on how you parse it)" rules={[{ required: true, message: 'Content is required' }]}>
          <Input.TextArea rows={12} placeholder="Write your blog content here (supports basic HTML injection)" />
        </Form.Item>

        <Form.Item name="coverImage" label="Cover Image URL">
          <Input placeholder="https://example.com/cover.jpg" />
        </Form.Item>

        <div ref={pasteRef} className="border border-dashed border-gray-300 p-4 rounded-lg mb-6 max-w-lg mt-2">
           <Dragger
             accept="image/*"
             showUploadList={false}
             customRequest={({ file }) => uploadToImageKit(file as RcFile)}
             disabled={loading}
           >
             <p className="ant-upload-drag-icon"><InboxOutlined /></p>
             <p className="ant-upload-text">Click, drag & drop, or paste image to upload to ImageKit</p>
           </Dragger>
        </div>

        <Form.Item dependencies={['coverImage']} noStyle>
           {() => form.getFieldValue('coverImage') ? (
             <div style={{ marginBottom: 24, maxWidth: 300 }}>
               <Image src={form.getFieldValue('coverImage')} alt="Cover Preview" style={{ borderRadius: 8 }} preview />
             </div>
           ) : null}
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <Input placeholder="trading, zones, stocks (comma separated)" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="metaTitle" label="SEO Meta Title" style={{ flex: 1 }}>
            <Input placeholder="Optional override for strict SEO title" />
          </Form.Item>
          
          <Form.Item name="metaDescription" label="SEO Meta Description" style={{ flex: 1 }}>
            <Input placeholder="Optional override for SEO meta tag description" />
          </Form.Item>
        </div>

        <Form.Item name="isPublished" label="Publish Immediately" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            Save Blog
          </Button>
          <Button style={{ marginLeft: 12 }} onClick={() => router.push('/v1/admin/blogs')} size="large">
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
