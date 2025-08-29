"use client";
// pages/notes.tsx
import { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  List,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PushpinOutlined,
  PushpinFilled,
} from "@ant-design/icons";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Nifty Demand Zone",
      content: "Strong buying expected near 17800 – 17900 zone.",
      tags: ["Nifty", "DemandZone"],
      isPinned: true,
    },
    {
      id: "2",
      title: "Feature add",
      content: "To the team, diplay the in range zones when they are around 8% up and set the quality so that when the alert will come, it will be fine grained to the users as already verified and normal zones will be filtered by the team",
      tags: ["BankNifty", "Support"],
      isPinned: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form] = Form.useForm();

  const openAddModal = () => {
    setEditingNote(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    form.setFieldsValue(note);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingNote) {
        // Update note
        setNotes(
          notes.map((n) =>
            n.id === editingNote.id ? { ...editingNote, ...values } : n
          )
        );
      } else {
        // Add new note
        const newNote: Note = {
          id: String(Date.now()),
          isPinned: false,
          ...values,
        };
        setNotes([...notes, newNote]);
      }
      setIsModalOpen(false);
    });
  };

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  // Sort pinned notes to the top
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) return 0;
    return a.isPinned ? -1 : 1;
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>📓 Notes</h1>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={openAddModal}
        style={{ marginBottom: 16 }}
      >
        Add Note
      </Button>

      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={sortedNotes}
        renderItem={(note) => (
          <List.Item>
            <Card
              title={
                <span>
                  {note.title}{" "}
                  {note.isPinned && (
                    <Tag color="gold" style={{ marginLeft: 8 }}>
                      Pinned
                    </Tag>
                  )}
                </span>
              }
              actions={[
                <Tooltip title={note.isPinned ? "Unpin" : "Pin"} key="pin">
                  {note.isPinned ? (
                    <PushpinFilled onClick={() => togglePin(note.id)} />
                  ) : (
                    <PushpinOutlined onClick={() => togglePin(note.id)} />
                  )}
                </Tooltip>,
                <EditOutlined key="edit" onClick={() => openEditModal(note)} />,
                <DeleteOutlined key="delete" onClick={() => handleDelete(note.id)} />,
              ]}
            >
              <p>{note.content}</p>
              <div>
                {note.tags?.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingNote ? "Edit Note" : "Add Note"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: "Please enter content" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Tags (comma separated)" name="tags">
            <Input
              onChange={(e) => {
                form.setFieldsValue({
                  tags: e.target.value.split(",").map((t) => t.trim()),
                });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
