import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import type { CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

type FieldErrors = Partial<Record<keyof CreateCategoryRequest, string>>;

function validate(values: CreateCategoryRequest): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name.trim()) errors.name = 'Informe o nome.';
  if (!values.slug.trim()) errors.slug = 'Informe o slug.';
  if (values.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(values.slug)) {
    errors.slug = 'Use letras minusculas, numeros e hifens.';
  }
  if (!values.description.trim()) errors.description = 'Informe a descricao.';
  if (values.displayOrder !== undefined && (!Number.isInteger(values.displayOrder) || values.displayOrder < 1)) {
    errors.displayOrder = 'Use um numero inteiro positivo.';
  }

  return errors;
}

function Field({
  label,
  value,
  onChangeText,
  error,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: AppColors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={{
          minHeight: multiline ? 86 : 48,
          borderWidth: 1,
          borderColor: error ? AppColors.danger : AppColors.border,
          borderRadius: 14,
          padding: 12,
          color: AppColors.text,
          backgroundColor: AppColors.surface,
          fontSize: 16,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
      />
      {error ? (
        <Text selectable style={{ color: AppColors.danger, fontSize: 13, lineHeight: 18 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function CategoryForm({
  initialValue,
  submitLabel,
  pending = false,
  onSubmit,
}: {
  initialValue?: Partial<CreateCategoryRequest>;
  submitLabel: string;
  pending?: boolean;
  onSubmit(payload: CreateCategoryRequest | UpdateCategoryRequest): Promise<void>;
}) {
  const [name, setName] = useState(initialValue?.name ?? '');
  const [slug, setSlug] = useState(initialValue?.slug ?? '');
  const [description, setDescription] = useState(initialValue?.description ?? '');
  const [displayOrder, setDisplayOrder] = useState(
    initialValue?.displayOrder === undefined ? '' : String(initialValue.displayOrder)
  );
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    setName(initialValue?.name ?? '');
    setSlug(initialValue?.slug ?? '');
    setDescription(initialValue?.description ?? '');
    setDisplayOrder(initialValue?.displayOrder === undefined ? '' : String(initialValue.displayOrder));
    setErrors({});
  }, [initialValue?.name, initialValue?.slug, initialValue?.description, initialValue?.displayOrder]);

  async function handleSubmit() {
    const payload: CreateCategoryRequest = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      displayOrder: displayOrder.trim() ? Number(displayOrder) : undefined,
    };
    const nextErrors = validate(payload);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit(payload);
  }

  return (
    <View style={{ gap: 14 }}>
      <Field label="Nome" value={name} onChangeText={setName} error={errors.name} />
      <Field label="Slug" value={slug} onChangeText={setSlug} error={errors.slug} />
      <Field
        label="Descricao"
        value={description}
        onChangeText={setDescription}
        error={errors.description}
        multiline
      />
      <Field
        label="Ordem"
        value={displayOrder}
        onChangeText={setDisplayOrder}
        error={errors.displayOrder}
        keyboardType="number-pad"
      />
      <Pressable
        accessibilityRole="button"
        disabled={pending}
        onPress={() => void handleSubmit()}
        style={({ pressed }) => ({
          minHeight: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          backgroundColor: AppColors.primary,
          opacity: pending || pressed ? 0.72 : 1,
        })}>
        <Text style={{ color: AppColors.primaryForeground, fontSize: 16, fontWeight: '800' }}>
          {pending ? 'Salvando...' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
