package br.edu.fatecpg.usafa.shared.page; // Ajuste o pacote

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageCacheWrapper<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
}